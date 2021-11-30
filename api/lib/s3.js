const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION });
const { Err } = require('@openaddresses/batch-schema');

/**
 * @class
 */
class S3 {
    constructor(params) {
        this.params = params;
    }

    static async put(key, stream) {
        try {
            if (!process.env.ASSET_BUCKET) throw new Err(400, null, 'ASSET_BUCKET not set');

            await s3.upload({
                Bucket: process.env.ASSET_BUCKET,
                Key: key,
                Body: stream
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to upload file');
        }
    }

    static async del(key) {
        if (!process.env.ASSET_BUCKET) return;

        try {
            await s3.deleteObject({
                Bucket: process.env.ASSET_BUCKET,
                Key: key
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to delete file');
        }
    }

    stream(res, name) {
        const s3request = s3.getObject(this.params);
        const s3stream = s3request.createReadStream();

        s3request.on('httpHeaders', (statusCode, headers) => {
            headers['Content-disposition'] = `inline; filename="${name}"`;

            res.writeHead(statusCode, headers);
        });

        s3stream.on('error', (err) => {
            // Could not find object, ignore
            console.error(err);
        });

        s3stream.pipe(res);
    }
}

module.exports = S3;
