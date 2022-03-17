const test = require('tape');
const AWS = require('@mapbox/mock-aws-sdk-js');
const Task = require('../task.js');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

test('PyTorch Segmentation', async (t) => {
    nock('http://example.com')
        .patch('/api/project/1/iteration/18')
        .reply(200, {})
        .get('/api/project/1/iteration/18')
        .reply(200, {
            id: 18,
            model_type: 'pytorch'
        })

    AWS.stub('S3', 'getObject', function(params) {
        t.equals(params.Bucket, 'ml-enabler-test-1234-us-east-1');
        t.equals(params.Key, 'project/1/iteration/18/model.mar');

        return this.request.createReadStream.returns(function() {
            return fs.createReadStream(path.resolve(__dirname, 'fixtures/pytorch-seg.mar'))
        });
    });

    AWS.stub('S3', 'putObject', function(params) {
        t.equals(params.Bucket, 'ml-enabler-test-1234-us-east-1');
        t.equals(params.Key, 'project/1/iteration/18/docker.mar');

        return this.request.promise.returns(Promise.resolve());
    });

    try {
        await Task.build({
            ecr: 'test',
            task: 1,
            url: 'http://example.com',
            token: '123',
            model: 'ml-enabler-test-1234-us-east-1/project/1/iteration/18/model.mar',
            dryrun: true
        });
    } catch (err) {
        t.error(err);
    }

    AWS.S3.restore();
    nock.restore();
    t.end();
});
