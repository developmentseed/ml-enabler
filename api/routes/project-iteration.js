import Err from '@openaddresses/batch-error';
import Iteration from '../lib/types/project-iteration.js';
import Imagery from '../lib/types/project-imagery.js';
import Stack from '../lib/stack.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/project/:pid/iteration List Iteration
     * @apiVersion 1.0.0
     * @apiName ListIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all model iterations within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListIterations.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListIterations.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration', {
        ':pid': 'integer',
        query: 'req.query.ListIterations.json',
        res: 'res.ListIterations.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.pid = req.params.pid;
            const list = await Iteration.list(config.pool, req.params.pid, req.query);

            let stacks = [];
            if (config.Environment) {
                stacks = (await Stack.list(config.StackName + '-')).map((s) => {
                    return s.StackName;
                });
            }

            list.iterations = list.iterations.map((i) => {
                i.stack = false;

                for (const s of stacks) {
                    if (new RegExp(config.StackName + '-project-' + req.params.pid + '-iteration-' + i.id + '$').test(s)) {
                        i.stack = true;
                    }
                }

                return i;
            });

            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/iteration Create Iteration
     * @apiVersion 1.0.0
     * @apiName CreateIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new iteration within a project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateIteration.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration', {
        ':pid': 'integer',
        body: 'req.body.CreateIteration.json',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.pid = req.params.pid;

            const img = await Imagery.from(config.pool, req.body.imagery_id);

            if (img.pid !== req.params.pid) {
                throw new Err(401, null, 'Referenced imagery must be part of project');
            }

            const iter = await Iteration.generate(config.pool, req.body);

            return res.json(iter.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/latest Latest Iteration
     * @apiVersion 1.0.0
     * @apiName LatestIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Get the latest iteration by SemVer
     *
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/latest', {
        ':pid': 'integer',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const iter = await Iteration.latest(config.pool, req.params.pid);
            return res.json(iter.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid Get Iteration
     * @apiVersion 1.0.0
     * @apiName GetIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Get a new iteration
     *
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const iter = await Iteration.from(config.pool, req.params.iterationid);
            return res.json(iter.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/iteration/:iterationid Patch Iteration
     * @apiVersion 1.0.0
     * @apiName PatchIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Upate an existing iteration
     *
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.patch('/project/:pid/iteration/:iterationid', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        body: 'req.body.PatchIteration.json',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const iter = await Iteration.from(config.pool, req.params.iterationid);
            iter.patch(req.body);
            await iter.commit(config.pool);

            return res.json(iter.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
