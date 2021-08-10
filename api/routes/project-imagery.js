'use strict';

const Err = require('../lib/error');
const Imagery = require('../lib/project/imagery');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/imagery List Imagery
     * @apiVersion 1.0.0
     * @apiName ListImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all imagery sources within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListImagery.json} apiSuccess
     */
    await schema.get('/project/:pid/imagery', {
        query: 'req.query.ListImagery.json',
        res: 'res.ListImagery.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');

            req.query.pid = req.params.pid;
            res.json(await Imagery.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/imagery Create Imagery
     * @apiVersion 1.0.0
     * @apiName CreateImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new imagery source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.post('/project/:pid/imagery', {
        body: 'req.body.CreateImagery.json',
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');

            req.body.pid = req.params.pid;
            const img = await Imagery.generate(config.pool, req.body);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/imagery/:imageryid Get Imagery
     * @apiVersion 1.0.0
     * @apiName GetImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single imagery source
     *
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.get('/project/:pid/imagery/:imageryid', {
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'imageryid');

            const img = await Imagery.from(config.pool, req.params.imageryid);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/imagery/:imageryid Patch Imagery
     * @apiVersion 1.0.0
     * @apiName PatchImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Update an imagery source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.patch('/project/:pid/imagery/:imageryid', {
        body: 'req.body.PatchImagery.json',
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'imageryid');

            const img = await Imagery.from(config.pool, req.params.imageryid);
            img.patch(req.body);
            await img.commit(config.pool);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/imagery/:imageryid delete Imagery
     * @apiVersion 1.0.0
     * @apiName DeleteImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Delete an imagery source
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/imagery/:imageryid', {
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'imageryid');

            const img = await Imagery.from(config.pool, req.params.imageryid);
            await img.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Imagery Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
