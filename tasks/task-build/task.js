#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const unzipper = require('unzipper');
const find = require('find');
const request = require('request');
const mkdir = require('mkdirp').sync;
const { pipeline } = require('stream');
const fs = require('fs');
const fse = require('fs-extra');
const os = require('os');
const CP = require('child_process');
const path = require('path');
const AWS = require('aws-sdk');

const TFServing = require('./lib/tfserving');
const PTServing = require('./lib/ptserving');

const batch = new AWS.Batch({ region: process.env.AWS_REGION || 'us-east-1' });
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * @class
 */
class Task {
    /**
     * Build a Docker Image given an ML Model
     *
     * @param {object}  opts                    Options Object
     * @param {string}  opts.model              Model ID
     * @param {string}  opts.url                MLEnabler API URL
     * @param {string}  opts.token              MLEnabler API Token
     * @param {string}  opts.ecr                AWS ECR name
     * @param {string}  opts.task               MLEnabler Task ID
     * @param {boolean} [opts.silent=false]     Should output be squelched
     */
    static async build(opts) {
        if (!opts.silent) opts.silent = false;

        const tmp = os.tmpdir() + '/' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        mkdir(tmp);

        if (!opts.silent) console.error(`ok - tmp dir: ${tmp}`);
        for (const opt of ['url', 'token', 'model', 'ecr', 'task']) {
            if (!opts[opt]) throw new Error(`opts.${opt} must be set`);
        }

        const project_id = get_project_id(opts.model);
        const iteration_id = get_iteration_id(opts.model);

        const links = {
            model_link: opts.model
        };

        if (process.env.AWS_BATCH_JOB_ID) {
            const logLink = await get_log_link(opts);
            await set_log_link(opts, project_id, iteration_id, opts.task, logLink);
        }

        await set_link(opts, project_id, iteration_id, links);

        const dd = await dockerd();

        const iteration = await get_iteration(opts, project_id, iteration_id);

        await download(opts, tmp, iteration);

        await std_model(opts, tmp, iteration);

        const finalLinks = await docker(opts, tmp, opts.model, iteration);

        links.save_link = finalLinks.save;
        links.docker_link = finalLinks.docker;

        await set_link(opts, project_id, iteration_id, links);

        dd.kill();
    }
}

if (require.main === module) {
    const args = minimist(process.argv, {
        stream: ['model', 'ecr', 'url', 'token', 'task'],
        boolean: ['silent'],
        default: {
            silent: false,
            url: process.env.API_URL,
            token: process.env.TOKEN,
            model: process.env.MODEL,
            ecr: process.env.BATCH_ECR,
            task: process.env.TASK_ID
        }
    });

    if (!args.silent) {
        console.log('ok - starting Task.build');
        console.log(`ok - ecr: ${args.ecr}`);
        console.log(`ok - task: ${args.task}`);
        console.log(`ok - model: ${args.model}`);
    }

    (async () => {
        try {
            await Task.build(args);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })();
}

function get_project_id(model) {
    // ml-enabler-test-1234-us-east-1/project/1/iteration/18/model.<ext>
    return parseInt(model.split('/')[2]);
}

function get_iteration_id(model) {
    // ml-enabler-test-1234-us-east-1/project/1/iteration/18/model.<ext>
    return parseInt(model.split('/')[4]);
}

function get_log_link(opts) {
    return new Promise((resolve, reject) => {
        // Allow local runs

        link();

        function link() {
            if (!opts.silent) console.error(`ok - getting meta for job: ${process.env.AWS_BATCH_JOB_ID}`);

            batch.describeJobs({
                jobs: [process.env.AWS_BATCH_JOB_ID]
            }, (err, res) => {
                if (err) return reject(err);

                if (
                    !res.jobs[0]
                    || !res.jobs[0].container
                    || !res.jobs[0].container.logStreamName
                ) {
                    setTimeout(() => {
                        return link();
                    }, 10000);
                } else {
                    resolve(res.jobs[0].container.logStreamName);
                }
            });
        }
    });
}

function get_iteration(opts, project, iteration) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: `${opts.url}/api/project/${project}/iteration/${iteration}`,
            json: true,
            auth: {
                bearer: opts.token
            }
        }, (err, res) => {
            if (err) return reject(err);

            if (res.statusCode === 200) {
                return resolve(res.body);
            } else {
                return reject(res.statusCode + ':' + typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
            }
        });
    });
}

function set_log_link(opts, project, iteration, task, log) {
    return new Promise((resolve, reject) => {
        if (!opts.silent) console.error(`ok - saving log_link (proj ${project}), iteration (${iteration}) task: ${task} log: ${log}))`);

        request({
            method: 'PATCH',
            url: `${opts.url}/api/project/${project}/iteration/${iteration}/task/${task}`,
            auth: {
                bearer: opts.token
            },
            json: true,
            body: {
                log_link: log
            }
        }, (err, res) => {
            if (err) return reject(err);

            if (res.statusCode === 200) {
                return resolve(res);
            } else {
                return reject(res.statusCode + ':' + typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
            }
        });
    });
}

function set_link(opts, project, iteration, patch) {
    return new Promise((resolve, reject) => {
        if (!opts.silent) console.error(`ok - saving project (${project}), iteration (${iteration}) state: ${JSON.stringify(patch)}`);

        request({
            method: 'PATCH',
            url: `${opts.url}/api/project/${project}/iteration/${iteration}`,
            auth: {
                bearer: opts.token
            },
            json: true,
            body: patch
        }, (err, res) => {
            if (err) return reject(err);

            if (res.statusCode === 200) {
                return resolve(res);
            } else {
                return reject(res.statusCode + ':' + typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
            }
        });
    });
}

function std_model(opts, tmp, iteration) {
    if (iteration.model_type === 'tensorflow') {
        return new Promise((resolve, reject) => {
            find.file('saved_model.pb', path.resolve(tmp, '/src'), (files) => {

                if (files.length !== 1) return reject(new Error('zip must contain exactly 1 model'));

                path.parse(files[0]).dir;

                mkdir(tmp + '/MODEL/001');

                fse.move(path.parse(files[0]).dir, tmp + '/MODEL/001/', {
                    overwrite: true
                }, (err) => {
                    if (err) return reject(err);

                    if (!opts.silent) console.error(tmp + '/MODEL/001/');
                    return resolve(tmp + '/MODEL/001/');
                });
            });
        });
    } else if (iteration.model_type === 'pytorch') {
        return new Promise((resolve) => {
            return resolve(path.resolve(tmp, 'model.mar'));
        });
    } else {
        return new Promise((resolve, reject) => {
            return reject(new Error('Unsupported Model Type'));
        });
    }
}

function download(opts, tmp, iteration) {
    if (!opts.silent) console.error(`ok - fetching ${opts.model}`);

    return new Promise((resolve, reject) => {
        if (iteration.model_type === 'tensorflow') {
            const loc = path.resolve(tmp, 'model.zip');

            pipeline(
                s3.getObject({
                    Bucket: opts.model.split('/')[0],
                    Key: opts.model.split('/').splice(1).join('/')
                }).createReadStream(),
                unzipper.Extract({
                    path: path.resolve(tmp, '/src')
                })
                , (err) => {
                    if (err) return reject(err);

                    console.error(`ok - saved: ${loc}`);
                    return resolve(loc);
                });
        } else if (iteration.model_type === 'pytorch') {
            const loc = path.resolve(tmp, 'model.mar');

            pipeline(
                s3.getObject({
                    Bucket: opts.model.split('/')[0],
                    Key: opts.model.split('/').splice(1).join('/')
                }).createReadStream(),
                fs.createWriteStream(loc)
                , (err) => {
                    if (err) return reject(err);

                    console.error(`ok - saved: ${loc}`);

                    return resolve(loc);
                });
        }
    });
}

function dockerd() {
    return new Promise((resolve, reject) => {
        console.error('ok - spawning dockerd');
        const dockerd = CP.spawn('dockerd');

        dockerd.stderr.on('data', (data) => {
            data = String(data);
            process.stdout.write(data);

            if (/API listen on/.test(data)) {
                setTimeout(() => {
                    return resolve(dockerd);
                }, 5000);
            } else if (/ensure docker is not running/.test(data)) {
                return resolve(dockerd);
            }
        }).on('error', (err) => {
            return reject(err);
        });
    });
}

async function docker(opts, tmp, model, iteration) {
    const tagged_model = model.split('/').splice(1).join('-').replace(/-model\.zip/, '');

    let tag;
    if (iteration.model_type === 'tensorflow') {
        tag = TFServing(tmp, model, tagged_model);
    } else {
        tag = PTServing(tmp, model, tagged_model);
    }

    const push = `${opts.ecr}:${tagged_model}`;
    CP.execSync(`
        docker tag ${tag} ${push}
    `);

    CP.execSync(`
        $(aws ecr get-login --region us-east-1 --no-include-email)
    `);

    CP.execSync(`
        docker push ${push}
    `);
    if (!opts.silent) console.error('ok - pushed image to AWS:ECR');

    CP.execSync(`
        docker save ${tag} | gzip > ${tmp}/docker-${tagged_model}.tar.gz
    `);
    if (!opts.silent) console.error('ok - saved image to disk');

    await s3.putObject({
        Bucket: model.split('/')[0],
        Key: model.split('/').splice(1).join('/').replace(/model\.(mar|zip)/, `docker-${tagged_model}.tar.gz`),
        Body: fs.createReadStream(path.resolve(tmp, `docker-${tagged_model}.tar.gz`))
    }).promise();

    if (!opts.silent) console.error('ok - saved image to s3');

    return {
        docker: `${opts.ecr}:${tagged_model}`,
        save: model.split('/')[0] + '/' + model.split('/').splice(1).join('/').replace(/model\.(zip|mar)/, `docker-${tagged_model}.tar.gz`)
    };
}

module.export = Task;
