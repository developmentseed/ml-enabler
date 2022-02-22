'use strict';
import { fileURLToPath } from 'url';
import process from 'process';
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import TileBase from 'tilebase';
import Tippecanoe from './lib/tippecanoe.js';
import B64PNG from './lib/b64png.js';
import RL from 'readline';
import minimist from 'minimist';
import MLEnabler from './lib/api.js';

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
     * @param {string} opts.url             MLEnabler API URL
     * @param {string} opts.token           MLEnabler API Token
     * @param {string} opts.project         MLEnabler Project ID
     * @param {string} opts.iteration       MLEnabler Iteration ID
     * @param {string} opts.submission      MLEnabler Submission ID
     * @param {string} [opts.bucket=false]  S3 Bucket to put data - if omitted, data is not uploaded
     * @param {boolean} [opts.silent=false] Should output be squelched
     */
    static async vectorize(input, opts = {}) {
        if (!opts.tmp) opts.tmp = new URL('./data/', import.meta.url).pathname;
        if (!opts.silent) opts.silent = false;
        if (!opts.bucket) {
            opts.bucket = false;
        } else if (opts.bucket && (!opts.project || !opts.iteration || !opts.submission)) {
            throw new Error('If opts.bucket is set, opts.<project, iteration, submission> must be also');
        }

        for (const opt of ['url', 'token', 'project', 'iteration']) {
            if (!opts[opt]) throw new Error(`opts.${opt} must be set`);
        }

        const mlenabler = new MLEnabler(opts.url, opts.token);

        const iteration = await mlenabler.iteration.from(opts.project, opts.iteration);

        const type = await Task.#sniff(input);

        if (type === 'Feature') {
            if (!opts.silent) console.log('ok - detected Feature input');
            await Task.#feature(input, opts);
        } else if (type === 'Image') {
            if (!opts.silent) console.log('ok - detected Image input');
            await Task.#image(input, opts, iteration);
        } else {
            throw new Error('Unsupported File Type');
        }

        if (!opts.silent) console.log(`ok - writing to: ${opts.tmp}`);

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

    static async #image(input, opts, iteration) {
        const b64png = new B64PNG(iteration.inf_list.map((cls) => cls.color));
        await b64png.convert(input, opts);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = minimist(process.argv, {
        string: ['bucket', 'input', 'tmp', 'url', 'token'],
        boolean: ['silent'],
        default: {
            silent: false,
            bucket: process.env.ASSET_BUCKET,
            project: process.env.PROJECT_ID,
            iteration: process.env.ITERATION_ID,
            submission: process.env.SUBMISSION_ID,
            url: process.env.API_URL,
            token: process.env.TOKEN,
            input: new URL('./data/input.geojson', import.meta.url).pathname,
            tmp: new URL('./data/', import.meta.url).pathname
        }
    });


    console.log('ok - starting Task.vectorize');
    console.log(`ok - bucket: ${args.bucket}`);
    console.log(`ok - project: ${args.project}`);
    console.log(`ok - iteration: ${args.iteration}`);
    console.log(`ok - submission: ${args.submission}`);

    Task.vectorize(args.input, {
        tmp: args.tmp,
        url: args.url,
        token: args.token,
        silent: args.silent,
        bucket: args.bucket,
        project: args.project,
        iteration: args.iteration,
        submission: args.submission
    });
}

export default Task;
