#!/usr/bin/env node
'use strict';

const unzipper = require('unzipper');
const find = require('find');
const request = require('request');
const mkdir = require('mkdirp').sync;
const pipeline = require('stream').pipeline;
const fs = require('fs');
const fse = require('fs-extra');
const os = require('os');
const CP = require('child_process');
const path = require('path');
const AWS = require('aws-sdk');

const TFServing = require('./lib/tfserving');
// const PyTorchServing = require('./lib/ptserving');

const batch = new AWS.Batch({ region: process.env.AWS_REGION || 'us-east-1' });
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });

main();

async function main() {
    try {
        if (!process.env.MODEL) throw new Error('MODEL env var not set');
        if (!process.env.TOKEN) throw new Error('TOKEN env var not set');
        if (!process.env.BATCH_ECR) throw new Error('BATCH_ECR env var not set');
        if (!process.env.AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUT_ID env var not set');
        if (!process.env.AWS_REGION) throw new Error('AWS_REGION env var not set');
        if (!process.env.API_URL) throw new Error('API_URL env var not set');
        if (!process.env.TASK_ID) throw new Error('TASK_ID env var not set');

        const tmp = os.tmpdir() + '/' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const model = process.env.MODEL;

        console.error(`ok - tmp dir: ${tmp}`);

        console.error(process.env);

        const project_id = get_project_id(model);
        const iteration_id = get_iteration_id(model);

        const links = {
            model_link: model
        };

        if (process.env.AWS_BATCH_JOB_ID) {
            const logLink = await get_log_link();
            await set_log_link(project_id, iteration_id, process.env.TASK_ID, logLink);
        }

        await set_link(project_id, iteration_id, links);

        const dd = await dockerd();

        const iteration = await get_iteration(project_id, iteration_id);

        await get_zip(tmp, model);

        await std_model(tmp, iteration);

        const finalLinks = await docker(tmp, model);

        links.save_link = finalLinks.save;
        links.docker_link = finalLinks.docker;

        await set_link(project_id, iteration_id, links);

        dd.kill();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

function get_project_id(model) {
    // ml-enabler-test-1234-us-east-1/project/1/iteration/18/model.zip
    return parseInt(model.split('/')[2]);
}

function get_iteration_id(model) {
    // ml-enabler-test-1234-us-east-1/project/1/iteration/18/model.zip
    return parseInt(model.split('/')[4]);
}

function get_log_link() {
    return new Promise((resolve, reject) => {
        // Allow local runs

        link();

        function link() {
            console.error(`ok - getting meta for job: ${process.env.AWS_BATCH_JOB_ID}`);

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

function get_iteration(project, iteration) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: `${process.env.API_URL}/api/project/${project}/iteration/${iteration}`,
            auth: {
                bearer: process.env.TOKEN
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

function set_log_link(project, iteration, task, log) {
    return new Promise((resolve, reject) => {
        console.error(`ok - saving log_link (proj ${project}), iteration (${iteration}) task: ${task} log: ${log}))`);

        request({
            method: 'PATCH',
            url: `${process.env.API_URL}/api/project/${project}/iteration/${iteration}/task/${task}`,
            auth: {
                bearer: process.env.TOKEN
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

function set_link(project, iteration, patch) {
    return new Promise((resolve, reject) => {
        console.error(`ok - saving project (${project}), iteration (${iteration}) state: ${JSON.stringify(patch)}`);

        request({
            method: 'PATCH',
            url: `${process.env.API_URL}/api/project/${project}/iteration/${iteration}`,
            auth: {
                bearer: process.env.TOKEN
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

function std_model(tmp, iteration) {
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

                    console.error(tmp + '/MODEL/001/');
                    return resolve(tmp + '/MODEL/001/');
                });
            });
        });
    } else if (iteration.model_type === 'pytorch') {
        return new Promise((resolve, reject) => {
            return reject(new Error('Unimplemented'));
        });
    } else {
        return new Promise((resolve, reject) => {
            return reject(new Error('Unsupported Model Type'));
        });
    }
}

function get_zip(tmp, model) {
    return new Promise((resolve, reject) => {
        console.error(`ok - fetching ${model}`);

        const loc = path.resolve(tmp, 'model.zip');

        pipeline(
            s3.getObject({
                Bucket: model.split('/')[0],
                Key: model.split('/').splice(1).join('/')
            }).createReadStream(),
            unzipper.Extract({
                path: path.resolve(tmp, '/src')
            }),
            (err) => {
                if (err) return reject(err);

                console.error(`ok - saved: ${loc}`);

                return resolve(loc);
            });
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
            }
        }).on('error', (err) => {
            return reject(err);
        });
    });
}

async function docker(tmp, model) {
    const tagged_model = model.split('/').splice(1).join('-').replace(/-model\.zip/, '');

    const tag = TFServing(tmp, model, tagged_model);

    const push = `${process.env.AWS_ACCOUNT_ID}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${process.env.BATCH_ECR}:${tagged_model}`;
    CP.execSync(`
        docker tag ${tag} ${push}
    `);

    CP.execSync(`
        $(aws ecr get-login --region us-east-1 --no-include-email)
    `);

    CP.execSync(`
        docker push ${push}
    `);
    console.error('ok - pushed image to AWS:ECR');

    CP.execSync(`
        docker save ${tag} | gzip > ${tmp}/docker-${tagged_model}.tar.gz
    `);
    console.error('ok - saved image to disk');

    await s3.putObject({
        Bucket: model.split('/')[0],
        Key: model.split('/').splice(1).join('/').replace(/model\.zip/, `docker-${tagged_model}.tar.gz`),
        Body: fs.createReadStream(path.resolve(tmp, `docker-${tagged_model}.tar.gz`))
    }).promise();

    console.error('ok - saved image to s3');

    return {
        docker: `${process.env.BATCH_ECR}:${tagged_model}`,
        save: model.split('/')[0] + '/' + model.split('/').splice(1).join('/').replace(/model\.zip/, `docker-${tagged_model}.tar.gz`)
    };
}
