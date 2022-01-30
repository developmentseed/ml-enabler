'use strict';
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const TileBase = require('tilebase');
const Tippecanoe = require('./lib/tippecanoe');
const B64PNG = require('./lib/b64png.js');
const RL = require('readline');

/**
 * @class
 */
class Task {

    /**
     * Take an input file and output a TileBase file
     *
     * @param {String} input GeoJSON input path
     * @param {Object} opts Options Object
     * @param {object} [opts.tmp=./data]    Temp Folder
     * @param {string} opts.project         MLEnabler Project ID
     * @param {string} opts.iteration       MLEnabler Iteration ID
     * @param {string} opts.submission      MLEnabler Submission ID
     * @param {string} [opts.bucket=false]  S3 Bucket to put data - if omitted, data is not uploaded
     * @param {boolean} [opts.silent=false] Should output be squelched
     */
    static async vectorize(input, opts = {}) {
        if (!opts.tmp) opts.tmp = path.resolve(__dirname, './data/');
        if (!opts.silent) opts.silent = false;
        if (!opts.bucket) {
            opts.bucket = false;
        } else if (opts.bucket && (!opts.project || !opts.iteration || !opts.submission)) {
            throw new Error('If opts.bucket is set, opts.<project, iteration, submission> must be also');
        }

        const type = await Task.#sniff(input);

        if (type === 'Feature') {
            await Task.#feature(input, opts);
        } else if (type === 'Image') {
            await Task.#image(input, opts);
        } else {
            throw new Error('Unsupported File Type');
        }


        if (!opts.silent) console.error(`ok - writing to: ${opts.tmp}`);

        await TileBase.to_tb(
            path.resolve(opts.tmp, 'fabric.mbtiles'),
            path.resolve(opts.tmp, 'fabric.tilebase')
        );

        if (opts.bucket) {
            const s3 = new AWS.S3({
                region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
            });

            await s3.putObject({
                ContentType: 'application/octet-stream',
                Bucket: opts.bucket,
                Key: `project/${opts.project}/iteration/${opts.iteration}/submission-${opts.submission}.tilebase`,
                Body: fs.createReadStream(path.resolve(opts.tmp, 'fabric.tilebase'))
            }).promise();
        }
    }

    static async #image(input, opts) {
        await B64PNG.convert(input, opts);
    }

    static async #feature(input, opts) {
        const tippecanoe = new Tippecanoe();

        await tippecanoe.tile(
            fs.createReadStream(input),
            path.resolve(opts.tmp, 'fabric.mbtiles'),
            {
                layer: 'data',
                std: !!opts.silent,
                force: true,
                name: `Project ${opts.project} - Iteration ${opts.iteration} - Submission ${opts.submission}`,
                attribution: `Project ${opts.project} - Iteration ${opts.iteration} - Submission ${opts.submission}`,
                description: `Project ${opts.project} - Iteration ${opts.iteration} - Submission ${opts.submission}`,
                limit: {
                    features: false,
                    size: false
                },
                zoom: {
                    max: 15,
                    min: 10
                }
            }
        );
    }

    /**
     * Sniff the first line of a line delimited GeoJSON file and determine
     * if it contains B64 encoded images or Features
     *
     * @param {string}  input   Input Path
     * @return {string}         "Image" / "Feature"
     */
    static #sniff(input) {
        return new Promise((resolve, reject) => {
            let type = false;

            const rl = RL.createInterface({
                input: fs.createReadStream(input)
            }).on('line', (line) => {
                try {
                    line = JSON.parse(line);
                } catch (err) {
                    type = false;
                }
                if (['Image', 'Feature'].includes(line.type)) {
                    type = line.type;
                }

                rl.close();

                return resolve(type);
            }).on('error', (err) => {
                return reject(err);
            });
        });
    }
}

if (require.main === module) {
    Task.vectorize(path.resolve(__dirname, './data/input.geojson'), {
        silent: false,
        bucket: process.env.ASSET_BUCKET,
        project: process.env.PROJECT_ID,
        iteration: process.env.ITERATION_ID,
        submission: process.env.SUBMISSION_ID
    });
}

module.exports = Task;
