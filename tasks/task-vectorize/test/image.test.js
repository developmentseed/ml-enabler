'use strict';
const test = require('tape');
const path = require('path');
const os = require('os');
const Task = require('..');
const AWS = require('@mapbox/mock-aws-sdk-js');

test('Image', async (t) => {
    AWS.stub('S3', 'putObject', function(params) {
        t.equals(params.Bucket, 's3-bucket');
        t.equals(params.ContentType, 'application/octet-stream');
        t.equals(params.Key, 'project/1/iteration/2/submission-3.tilebase');
        t.ok(params.Body);

        return this.request.promise.returns(Promise.resolve({ }));
    });

    try {
        await Task.vectorize(path.resolve(__dirname, './fixtures/image.json'), {
            tmp: os.tmpdir(),
            bucket: 's3-bucket',
            project: 1,
            iteration: 2,
            submission: 3
        });
    } catch (err) {
        t.error(err);
    }

    t.end();
});
