'use strict';

const Err = require('../lib/error');
const S3 = require('../lib/s3');
const Busboy = require('busboy');
const Iteration = require('../lib/project/iteration');
const { Param } = require('../lib/util');
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
        query: 'req.query.UploadIterationAsset.json',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');

            config.is_aws();

            const iter = await Iteration.from(config.pool, req.params.iterationid);

            let file;
            const busboy = new Busboy({
                files: 1,
                headers: req.headers
            });

            let key = `project/${req.params.pid}/iteration/${req.params.iterationid}/${req.query.type}.zip`;

            busboy.on('file', (fieldname, file) => {
                file = S3.put(key, file);
            });

            busboy.on('finish', async () => {
                try {
                    await file;

                    let body = {};
                    body[`${req.query.type}_link`] = key;
                    iter.patch(body);
                    await iter.commit(config.pool);

                    Task.batch(config, {
                        environment: [{
                            name: 'MODEL',
                            value: process.env.ASSET_BUCKET + '/' + key
                        }]
                    });

                    return res.json(iter.serialize());
                } catch (err) {
                    Err.respond(res, err);
                }
            });

            req.pipe(busboy);
        } catch (err) {
            return Err.respond(err, res);
        }
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
        query: 'req.query.DownloadIterationAsset.json'
    }, async (req, res) => {
        try {
            req.auth = req.token;

            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');

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
