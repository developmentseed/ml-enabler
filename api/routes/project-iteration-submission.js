const { Err } = require('@openaddresses/batch-schema');
const Submission = require('../lib/project/iteration/submission');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/submission List Submission
     * @apiVersion 1.0.0
     * @apiName ListSubmission
     * @apiGroup Submissions
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of submission within an iteration
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListSubmissions.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListSubmission.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/submission', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.ListSubmissions.json',
        res: 'res.ListSubmission.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            res.json(await Submission.list(config.pool, req.params.iterationid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/submission/:subid Get Submission
     * @apiVersion 1.0.0
     * @apiName GetSubmission
     * @apiGroup Submissions
     * @apiPermission user
     *
     * @apiDescription
     *     Return all information about a single submission
     *
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/submission/:subid', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':subid': 'integer',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const sub = await Submission.from(config.pool, req.params.subid);

            return res.json(sub.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/submission/:subid/tiles TileJSON
     * @apiVersion 1.0.0
     * @apiName TileJSONSubmission
     * @apiGroup Submissions
     * @apiPermission user
     *
     * @apiDescription
     *     Return a TileJSON for the given submission
     *
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/submission/:subid/tiles', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':subid': 'integer',
        res: 'res.TileJSON.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const sub = await Submission.from(config.pool, req.params.subid);

            return res.json(sub.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
