'use strict';

const Err = require('../lib/error');
const S3 = require('../lib/s3');
const Busboy = require('busboy');
const Iteration = require('../lib/project/iteration');
const { Param } = require('../lib/util');

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

            if (config.Environment !== 'aws') throw new Err(400, null, 'Deployment must be in AWS Environment to use this endpoint');

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
                    body[`${req.query.type}`] = key;
                    iter.patch(body);
                    await iter.commit(config.pool);

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
}

module.exports = router;
