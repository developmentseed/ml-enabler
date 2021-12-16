'use strict';

const CP = require('child_process');
const path = require('path');
const fs = require('fs');

const base = 'pytorch/torchserve:0.5.0-gpu';

async function docker(tmp, model, tagged_model) {
    console.error(`ok - pulling ${base} docker image`);

    CP.execSync(`
        docker pull ${base}
    `);

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

    CP.execSync(`
        docker cp ${tmp}/model.mar serving_base:/home/model-server/model-store/
    `);

    const tag = `developmentseed/default:${Math.random().toString(36).substring(2, 15)}`;

    CP.execSync(`
        docker commit --change 'CMD torchserve --start --model-store model-store --models default=model.mar' serving_base ${tag}
    `);

    return tag;
}
