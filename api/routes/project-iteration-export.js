const { Err } = require('@openaddresses/batch-schema');
const Iteration = require('../lib/project/iteration');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION });
const Submission = require('../lib/project/iteration/submission');
const RL = require('readline');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/export
     * @apiVersion 1.0.0
     * @apiName GetExport
     * @apiGroup Export
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all model iterations within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.GetExport.json} apiParam
     */
    await schema.get('/project/:pid/iteration/:iterationid/export', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.GetExport.json'
    }, async (req, res) => {
        try {
            req.auth = req.token;
            await user.is_auth(req);

            let list = [];
            if (req.query.submission) {
                list.push(await Submission.from(config.pool, req.query.submission, req.params.pid));
            } else {
                list = (await Submission.list(config.pool, req.params.iterationid)).submissions.filter((s) => {
                    return s.storage;
                });
            }

            res.writeHead(200, {
                'Content-Disposition': `attachment; filename="ml-enabler-project-${req.params.pid}-iteration-${req.params.iterationid}.${req.query.format}"`
            });

            if (req.query.format === 'geojson') {
                res.write('{ "type": "FeatureCollection", "features": [\n');
            }

            req.query.first = true;
            for (const s of list) {
                if (!s.storage) continue;
                await s3read(res, `project/${req.params.pid}/iteration/${req.params.iterationid}/submission-${s.id}.geojson`, req.query);
            }

            if (req.query.format === 'geojson') {
                res.write('\n]}');
            }

            res.end();
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

async function s3read(out, key, query) {
    return new Promise((resolve, reject) => {
        const rl = RL.createInterface({
            input: s3.getObject({
                Bucket: process.env.ASSET_BUCKET,
                Key: key
            }).createReadStream(),
            output: out
        }).on('line', (line) => {
            if (!line.trim()) return;

            if (query.format === 'geojsonld') {
                out.write(line + '\n');
            } else if (query.format === 'geojson') {
                if (query.first) {
                    out.write(line);
                    query.first = false;
                } else {
                    out.write(',\n' + line);
                }
            }
        }).on('close', () => {
            return resolve();
        });
    });
}

module.exports = router;
