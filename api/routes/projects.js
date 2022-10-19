import Err from '@openaddresses/batch-error';
import Project from '../lib/types/project.js';
import ProjectAccess from '../lib/types/project-access.js';
import Stack from '../lib/stack.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {

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
     * @apiSchema {jsonschema=../schema/res.ListProjects.json} apiSuccess
     */
    await schema.get('/project', {
        query: 'req.query.ListProjects.json',
        res: 'res.ListProjects.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.user.id;

            const list = await Project.list(config.pool, req.query);

            let stacks = [];
            if (config.Environment === 'aws') {
                stacks = (await Stack.list(config.StackName + '-')).map((s) => {
                    return s.StackName;
                });
            }

            list.projects = list.projects.map((p) => {
                p.stacks = [];

                for (const s of stacks) {
                    if (new RegExp(config.StackName + '-project-' + p.id + '-').test(s)) {
                        p.stacks.push(s);
                    }
                }

                return p;
            });

            return res.json(list);
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
     * @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
     */
    await schema.post('/project', {
        body: 'req.body.CreateProject.json',
        res: 'res.Project.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
     * @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
     */
    await schema.get('/project/:pid', {
        ':pid': 'integer',
        res: 'res.Project.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            return res.json(req.project.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid Patch Project
     * @apiVersion 1.0.0
     * @apiName PatchProject
     * @apiGroup Projects
     * @apiPermission user
     *
     * @apiDescription
     *     Update a project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchProject.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
     */
    await schema.patch('/project/:pid', {
        ':pid': 'integer',
        body: 'req.body.PatchProject.json',
        res: 'res.Project.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.project.patch(req.body);
            await req.project.commit(config.pool);

            return res.json(req.project.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid Delete Project
     * @apiVersion 1.0.0
     * @apiName DeleteProject
     * @apiGroup Projects
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a project
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid', {
        ':pid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            await req.project.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Project Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
