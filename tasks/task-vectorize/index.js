const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const TileBase = require('tilebase');
const Tippecanoe = require('./lib/tippecanoe');

const s3 = new AWS.S3({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

const tippecanoe = new Tippecanoe();

const PROJECT = process.env.PROJECT_ID;
const ITERATION = process.env.ITERATION_ID;

main();

async function main() {
    await tippecanoe.tile(
        fs.createReadStream(path.resolve(__dirname, 'input.geojson')),
        path.resolve('fabric.mbtiles'),
        {
            layer: 'data',
            std: true,
            force: true,
            name: `Project ${PROJECT} - Iteration ${ITERATION}`,
            attribution: `Project ${PROJECT} - Iteration ${ITERATION}`,
            description: `Project ${PROJECT} - Iteration ${ITERATION}`,
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

    await TileBase.to_tb(
        path.resolve(__dirname, 'fabric.mbtiles'),
        path.resolve(__dirname, 'fabric.tilebase')
    );

    await s3.putObject({
        ContentType: 'application/octet-stream',
        Bucket: process.env.Bucket,
        Key: `project/${PROJECT}/iteration/${ITERATION}/fabric.tilebase`,
        Body: fs.createReadStream(path.resolve(__dirname, 'fabric.tilebase'))
    }).promise();

}
