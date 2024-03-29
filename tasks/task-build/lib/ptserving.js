'use strict';

const CP = require('child_process');
const path = require('path');
const fs = require('fs');

const VERSION = 'pytorch/torchserve:0.5.0-gpu';

function docker(tmp, model, tagged_model) {
    const exists = !!String(CP.execSync(`
        docker images ${VERSION}
    `)).split('\n')[1];


    if (!exists) {
        console.error(`ok - pulling ${VERSION} docker image`);

        CP.execSync(`
            docker pull ${VERSION}
        `);
    }

    // Ignore errors, these are to ensure the next commands don't err
    try {
        CP.execSync(`
            docker kill serving_base
        `);
    } catch (err) {
        console.error('ok - no old task to stop');
    }

    try {
        CP.execSync(`
            docker rm serving_base
        `);
    } catch (err) {
        console.error('ok - no old image to remove');
    }

    CP.execSync(`
        docker run -d --name serving_base ${base}
    `);

    console.error('ok - syncing model');
    CP.execSync(`
        docker cp ${tmp}/model.mar serving_base:/home/model-server/model-store/default.mar
    `);

    const tag = `developmentseed/default:${Math.random().toString(36).substring(2, 15)}`;

    CP.execSync(`
        docker commit --change 'CMD torchserve --start --ncs --model-store=/home/model-server/model-store/ --models default=default.mar' serving_base ${tag}
    `);

    console.error('ok - built base image');
    return tag;
}

module.exports = docker;
