
import { Err } from '@openaddresses/batch-schema';
import Iteration from '../lib/project/iteration.js';
import AWS from 'aws-sdk';
import Submission from '../lib/project/iteration/submission.js';
import { createObjectCsvStringifier } from 'csv-writer';
import RL from 'readline';
import User from '../lib/user.js';

const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION });

async function router(schema, config) {
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
            req.user = req.token;
            await User.is_auth(req);

            if (req.query.threshold && req.query.inferences === 'all') throw new Err(400, null, 'Threshold can only set if inferences is not "all"');

            let list = [];
            if (req.query.submission) {
                list.push(await Submission.from(config.pool, req.query.submission, req.params.pid));
            } else {
                list = (await Submission.list(config.pool, req.params.iterationid)).submissions.filter((s) => {
                    return s.storage;
                });
            }

            const iter = await Iteration.from(config.pool, req.params.iterationid);
            req.query.iterations = iter.inf_list.split(',');

            if (req.query.inferences !== 'all' && !req.query.iterations.includes(req.query.inferences)) {
                throw new Err(400, null, `inferences must be one of ${iter.inf_list}`);
            }

            res.writeHead(200, {
                'Content-Disposition': `attachment; filename="ml-enabler-project-${req.params.pid}-iteration-${req.params.iterationid}.${req.query.format}"`
            });

            if (req.query.format === 'geojson') {
                res.write('{ "type": "FeatureCollection", "features": [\n');
            } else if (req.query.format === 'csv') {
                req.query.csv = createObjectCsvStringifier({
                    header: [{
                        id: 'submission_id',
                        title: 'Submission ID'
                    },{
                        id: 'geometry',
                        title: 'Geometry'
                    }].concat(req.query.iterations.map((m) => {
                        return {
                            id: m,
                            title: m
                        };
                    }))
                });

                res.write(req.query.csv.getHeaderString());
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

            if (query.threshold) {
                try {
                    const feat = JSON.parse(line);

                    if (feat.properties[query.inferences] < query.threshold) return;
                } catch (err) {
                    return reject(err);
                }
            }

            if (query.format === 'geojsonld') {
                rl.output.write(line + '\n');
            } else if (query.format === 'geojson') {
                if (query.first) {
                    rl.output.write(line);
                    query.first = false;
                } else {
                    rl.output.write(',\n' + line);
                }
            } else if (query.format === 'csv') {
                try {
                    const feat = JSON.parse(line);
                    feat.properties.geometry = JSON.stringify(feat.geometry);
                    feat.properties.submission_id = feat.submission_id;
                    rl.output.write(query.csv.stringifyRecords([feat.properties]));
                } catch (err) {
                    console.error(err);
                    return reject(err);
                }
            }
        }).on('close', () => {
            return resolve();
        });
    });
}

export default router;
