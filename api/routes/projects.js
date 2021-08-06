'use strict';

const Err = require('../lib/error');
const Project = require('../lib/project');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project List Projects
     * @apiVersion 1.0.0
     * @apiName ListProjects
     * @apiGroup Projects
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all projects on the server that the user has access to
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListProjects.json} apiParam
     * @ apiSchema {jsonschema=../schema/res.ListProjects.json} apiSuccess
     */
    await schema.get('/project', {
        query: 'req.query.ListProjects.json',
        res: 'res.ListProjects.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.query.uid = req.auth.uid;
            res.json(await Project.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project Create Project
     * @apiVersion 1.0.0
     * @apiName CreateProject
     * @apiGroup Projects
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateProject.json} apiParam
     * @ apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
     */
    await schema.post('/project', {
        req: 'req.body.CreateProject.json',
        body: 'res.Project.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const project = Project.generate(config.pool, req.body);

            return res.json(project.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
