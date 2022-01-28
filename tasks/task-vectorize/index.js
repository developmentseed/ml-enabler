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
const SUBMISSION = process.env.SUBMISSION_ID;
const ASSET_BUCKET = process.env.ASSET_BUCKET;

/**
 * @class
 */
class Task {

    /**
     * Take an input file and output a TileBase file
     *
     * @param {String} input GeoJSON input path
     * @param {Object} opts Options Object
     */
    static async vectorize(input, opts) {
        await tippecanoe.tile(
            fs.createReadStream(input),
            path.resolve(__dirname, './data/fabric.mbtiles'),
            {
                layer: 'data',
                std: true,
                force: true,
                name: `Project ${PROJECT} - Iteration ${ITERATION} - Submission ${SUBMISSION}`,
                attribution: `Project ${PROJECT} - Iteration ${ITERATION} - Submission ${SUBMISSION}`,
                description: `Project ${PROJECT} - Iteration ${ITERATION} - Submission ${SUBMISSION}`,
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
            path.resolve(__dirname, './data/fabric.mbtiles'),
            path.resolve(__dirname, './data/fabric.tilebase')
        );

        await s3.putObject({
            ContentType: 'application/octet-stream',
            Bucket: ASSET_BUCKET,
            Key: `project/${PROJECT}/iteration/${ITERATION}/submission-${SUBMISSION}.tilebase`,
            Body: fs.createReadStream(path.resolve(__dirname, './data/fabric.tilebase'))
        }).promise();
    }
}

if (require.main === module) {
    Task.vectorize(path.resolve(__dirname, './data/input.geojson'), {

    });
}

module.exports = Task;
