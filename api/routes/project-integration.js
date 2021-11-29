

const { Err } = require('@openaddresses/batch-schema');
const Integration = require('../lib/project/integration');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/integration List Integration
     * @apiVersion 1.0.0
     * @apiName ListIntegration
     * @apiGroup Integrations
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all api integrations within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListIntegrations.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListIntegrations.json} apiSuccess
     */
    await schema.get('/project/:pid/integration', {
        ':pid': 'integer',
        query: 'req.query.ListIntegrations.json',
        res: 'res.ListIntegrations.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.query.pid = req.params.pid;
            res.json(await Integration.list(config.pool, req.params.pid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/integration Create Integration
     * @apiVersion 1.0.0
     * @apiName CreateIntegration
     * @apiGroup Integrations
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new integration within a project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateIntegration.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Integration.json} apiSuccess
     */
    await schema.post('/project/:pid/integration', {
        ':pid': 'integer',
        body: 'req.body.CreateIntegration.json',
        res: 'res.Integration.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.body.pid = req.params.pid;
            const integ = await Integration.generate(config.pool, req.body);

            return res.json(integ.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/integration/:integrationid Get Integration
     * @apiVersion 1.0.0
     * @apiName GetIntegration
     * @apiGroup Integrations
     * @apiPermission user
     *
     * @apiDescription
     *     Get an integration
     *
     * @apiSchema {jsonschema=../schema/res.Integration.json} apiSuccess
     */
    await schema.get('/project/:pid/integration/:integrationid', {
        ':pid': 'integer',
        ':integrationid': 'integer',
        res: 'res.Integration.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const integ = await Integration.from(config.pool, req.params.integrationid);
            return res.json(integ.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/integration/:integrationid Delete Integration
     * @apiVersion 1.0.0
     * @apiName DeleteIntegration
     * @apiGroup Integrations
     * @apiPermission user
     *
     * @apiDescription
     *     Delete an integration
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/integration/:integrationid', {
        ':pid': 'integer',
        ':integrationid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const integ = await Integration.from(config.pool, req.params.integrationid);
            await integ.delete(config.pool);
            return res.json({
                status: 200,
                message: 'Integration Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
