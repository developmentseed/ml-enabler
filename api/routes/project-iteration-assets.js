const { Err } = require('@openaddresses/batch-schema');
const S3 = require('../lib/s3');
const Busboy = require('busboy');
const Iteration = require('../lib/project/iteration');
const path = require('path');
const Task = require('../lib/project/iteration/task');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {post} /api/project/:pid/iteration/:iterationid/asset Upload
     * @apiVersion 1.0.0
     * @apiName UploadIterationAsset
     * @apiGroup IterationAssets
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new upload for an iteration
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.UploadIterationAsset.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration/:iterationid/asset', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.UploadIterationAsset.json',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            config.is_aws();
        } catch (err) {
            return Err.respond(err, res);
        }

        const busboy = new Busboy({
            files: 1,
            headers: req.headers
        });


        let iter, file, key;
        try {
            iter = await Iteration.from(config.pool, req.params.iterationid);
            key = `project/${req.params.pid}/iteration/${req.params.iterationid}/${req.query.type}.zip`;
        } catch (err) {
            return Err.respond(err, res);
        }

        busboy.on('file', (fieldname, fstream) => {
            file = S3.put(key, fstream);
        });

        busboy.on('finish', async () => {
            try {
                await file;

                const body = {};
                body[`${req.query.type}_link`] = key;
                iter.patch(body);
                await iter.commit(config.pool);

                if (req.query.type === 'model') {
                    await Task.batch(config, {
                        type: 'ecr',
                        name: `build-${req.params.pid}-${req.params.iterationid}`,
                        iter_id: iter.id,
                        environment: [{
                            name: 'MODEL',
                            value: process.env.ASSET_BUCKET + '/' + key
                        }]
                    });
                }

                return res.json(iter.serialize());
            } catch (err) {
                Err.respond(err, res);
            }
        });

        req.pipe(busboy);
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/asset Download
     * @apiVersion 1.0.0
     * @apiName DownloadIterationAsset
     * @apiGroup IterationAssets
     * @apiPermission user
     *
     * @apiDescription
     *     Download an iteration asset
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.DownloadIterationAsset.json} apiParam
     */
    await schema.get('/project/:pid/iteration/:iterationid/asset', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.DownloadIterationAsset.json'
    }, async (req, res) => {
        try {
            req.auth = req.token;

            await user.is_auth(req);

            config.is_aws();

            const iter = await Iteration.from(config.pool, req.params.iterationid);

            if (!iter[`${req.query.type}_link`]) throw new Err(400, null, 'Asset does not exist');

            res.type(path.parse('blob.zip').ext);
            const s3 = new S3({
                Bucket: process.env.ASSET_BUCKET,
                Key: iter[`${req.query.type}_link`]
            });

            return s3.stream(res, `project-${req.params.pid}-iteration-${req.params.iterationid}-${req.query.type}.zip`);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
