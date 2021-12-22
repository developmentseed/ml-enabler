const { Err } = require('@openaddresses/batch-schema');
const Submission = require('../lib/project/iteration/submission');
const TileBase = require('tilebase');

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

            const sub = await Submission.from(config.pool, req.params.subid, req.params.pid);

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

            const sub = await Submission.from(config.pool, req.params.subid, req.params.pid);

            if (!sub.storage) throw new Err(404, null, 'Submission has no TileSet');

            const tb = new TileBase(`s3://${process.env.ASSET_BUCKET}/project/${req.params.pid}/iteration/${req.params.iterationid}/submission-${req.params.subid}.tilebase`);
            await tb.open();

            const tj = tb.tilejson();
            tj.token = config.Mapbox;

            tj.tiles.push(`/api/project/${req.params.pid}/iteration/${req.params.iterationid}/submission/${req.params.subid}/tiles/{z}/{x}/{y}.mvt`);

            return res.json(tj);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/submission/:subid/tiles/:z/:x/:y.mvt Vector Tile
     * @apiVersion 1.0.0
     * @apiName VectorTileSubmission
     * @apiGroup Submissions
     * @apiPermission user
     *
     * @apiDescription
     *     Return a vector tile for the given submission
     */
    await schema.get('/project/:pid/iteration/:iterationid/submission/:subid/tiles/:z/:x/:y.mvt', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':subid': 'integer',
        ':z': 'integer',
        ':x': 'integer',
        ':y': 'integer'
    }, async (req, res) => {
        try {
            req.auth = req.token;

            await user.is_auth(req);

            const encodings = req.headers['accept-encoding'].split(',').map((e) => e.trim());
            if (!encodings.includes('gzip')) throw new Err(400, null, 'Accept-Encoding must include gzip');

            const sub = await Submission.from(config.pool, req.params.subid, req.params.pid);
            if (!sub.storage) throw new Err(404, null, 'Submission has no TileSet');

            const tb = new TileBase(`s3://${process.env.ASSET_BUCKET}/project/${req.params.pid}/iteration/${req.params.iterationid}/submission-${req.params.subid}.tilebase`);
            await tb.open();

            const tile = await tb.tile(req.params.z, req.params.x, req.params.y);

            res.writeHead(200, {
                'Content-Type': 'application/vnd.mapbox-vector-tile',
                'Content-Encoding': 'gzip',
                'cache-control': 'no-transform'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
