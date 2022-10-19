'use strict';
const { Err } = require('@openaddresses/batch-schema');
const Auth = require('../lib/auth');
const Meta = require('../lib/meta');
const Settings = require('../lib/settings');

async function router(schema, config) {

    /**
     * @api {get} /api/meta List Meta
     * @apiVersion 1.0.0
     * @apiName ListMeta
     * @apiGroup Meta
     * @apiPermission admin
     *
     * @apiDescription
     *     Return a list of metadata objects
     */
    await schema.get('/meta', {
        query: 'req.query.ListMeta.json',
        res: 'res.ListMeta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            res.json(await Meta.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/meta Create Meta
     * @apiVersion 1.0.0
     * @apiName CreateMeta
     * @apiGroup Meta
     * @apiPermission meta
     *
     * @apiDescription
     *     Create a new metadata object
     */
    await schema.post('/meta', {
        body: 'req.body.CreateMeta.json',
        res: 'res.Meta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Settings.generate(config.pool, req.body);

            return res.json(meta.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/meta/:key Update Meta
     * @apiVersion 1.0.0
     * @apiName PatchMeta
     * @apiGroup Meta
     * @apiPermission admin
     *
     * @apiDescription
     *     Update a metadata object
     *
     * @apiParam {String} :key Meta Key to update
     */
    await schema.patch('/meta/:key', {
        ':key': 'string',
        body: 'req.body.PatchMeta.json',
        res: 'res.Meta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Settings.from(config.pool, req.params.key);
            if (!(meta instanceof Meta)) throw new Err(400, null, 'Meta not found');

            Settings.patch(meta, req.body);
            await meta.commit(config.pool);

            res.json(meta.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/meta/:key Delete Meta
     * @apiVersion 1.0.0
     * @apiName PatchMeta
     * @apiGroup Meta
     * @apiPermission admin
     *
     * @apiDescription
     *     Update a metadata object
     *
     * @apiParam {String} :key Meta key to delete
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/meta/:key', {
        ':key': 'string',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Meta.from(config.pool, req.params.key);
            await meta.delete(config.pool);

            res.json({
                status: 200,
                message: 'Metadata Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
