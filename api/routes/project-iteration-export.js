const { Err } = require('@openaddresses/batch-schema');
const Iteration = require('../lib/project/iteration');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION });
const Submission = require('../lib/project/iteration/submission');

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
            if (req.params.submission) {
                list.push(req.params.submission);
            } else {
                list = (await Submission.list(config.pool, req.params.iterationid)).submissions.filter((s) => {
                    return s.storage;
                });
            }

            res.writeHead(200, {
                'Content-Disposition': `inline; filename="ml-enabler-project-${req.params.pid}-iteration-${req.params.iterationid}.${req.query.format}"`
            });

            for (const s of list) {
                if (!s.storage) continue;

                await s3read(res, `project/${req.params.pid}/iteration/${req.params.iterationid}/submission-${s.id}.geojson`);
            }

            res.json(true);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

async function s3read(out, key) {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: process.env.ASSET_BUCKET,
            Key: key
        }).createReadStream().on('data', (data) => {
            console.error(data);

            out.write(data);
        }).on('close', () => {
            return resolve();
        });
    });
}

module.exports = router;
