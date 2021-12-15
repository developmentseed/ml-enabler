'use strict';

const CP = require('child_process');
const path = require('path');
const fs = require('fs');

function docker(tmp, model, tagged_model) {
    console.error('ok - pulling tensorflow/serving docker image');

    CP.execSync(`
        docker pull tensorflow/serving:2.1.0-gpu
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
        docker run -d --name serving_base tensorflow/serving:2.1.0-gpu
    `);

    CP.execSync(`
        docker cp ${tmp}/MODEL/ serving_base:/models/default/ \
    `);

    const tag = `developmentseed/default:${Math.random().toString(36).substring(2, 15)}`;

    CP.execSync(`
        docker commit --change "ENV MODEL_NAME default" serving_base ${tag}
    `);

    return tag;
}
