'use strict';
import test from 'tape';
import os from 'os';
import Task from '../index.js';
import AWS from '@mapbox/mock-aws-sdk-js';
import { Iteration } from '../lib/api.js';
import Sinon from 'sinon';

test('Feature', async (t) => {
    AWS.stub('S3', 'putObject', function(params) {
        t.equals(params.Bucket, 's3-bucket');
        t.equals(params.ContentType, 'application/octet-stream');
        t.equals(params.Key, 'project/1/iteration/2/submission-3.tilebase');
        t.ok(params.Body);

        return this.request.promise.returns(Promise.resolve({ }));
    });

    Sinon.stub(Iteration.prototype, 'from').callsFake(() => {
        return Promise.resolve({
            id: 1
        });
    });

    try {
        await Task.vectorize(new URL('./fixtures/feature.json', import.meta.url).pathname, {
            tmp: os.tmpdir(),
            url: 'http://example.com',
            token: '123',
            bucket: 's3-bucket',
            project: 1,
            iteration: 2,
            submission: 3
        });
    } catch (err) {
        t.error(err);
    }

    Iteration.prototype.from.restore();
    AWS.S3.restore();
    t.end();
});
