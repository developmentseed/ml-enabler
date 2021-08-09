'use strict';

const Err = require('../lib/error');
const Project = require('../lib/project');
const ProjectAccess = require('../lib/project/access');
const { Param } = require('../lib/util');

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
        body: 'req.body.CreateProject.json',
        res: 'res.Project.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            if (!req.body.users.length) throw new Err(400, null, 'Users list cannot be empty');

            const project = await Project.generate(config.pool, req.body);

            for (const user of req.body.users) {
                user.pid = project.id;
                await ProjectAccess.generate(config.pool, user);
            }

            return res.json(project.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid Get Project
     * @apiVersion 1.0.0
     * @apiName GetProject
     * @apiGroup Projects
     * @apiPermission user
     *
     * @apiDescription
     *     Return a single project
     *
     * @ apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
     */
    await schema.get('/project/:pid', {
        res: 'res.Project.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');

            const project = await Project.from(config.pool, req.params.pid);

            return res.json(project.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
