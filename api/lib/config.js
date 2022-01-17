const CP = require('child_process');
const { sql, createPool, createTypeParserPreset } = require('slonik');
const { Err } = require('@openaddresses/batch-schema');
const wkx = require('wkx');
const bbox = require('@turf/bbox').default;
const AWS = require('aws-sdk');
const SNS = new AWS.SNS({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});
const STS = new AWS.STS({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

/**
 * @class
 */
class Config {
    static async env(args = {}) {
        const cnf = new Config();

        cnf.args = args;

        cnf.silent = !!args.silent;

        // if (!process.env.GitSha) {
        //     process.env.GitSha = String(CP.execSync('git rev-parse HEAD'));
        // }

        cnf.postgres = args.postgres || process.env.POSTGRES || 'postgres://postgres@localhost:5432/mlenabler';
        cnf.Environment = process.env.ENVIRONMENT || 'docker';
        cnf.region = process.env.AWS_DEFAULT_REGION || 'us-east-1';

        if (cnf.Environment === 'aws') {
            cnf.StackName = process.env.StackName;
            cnf.Stack = process.env.StackName;
            if (!cnf.StackName) throw new Error('StackName Required');

            if (process.env.AWS_ACCOUNT_ID && process.env.AWS_DEFAULT_REGION && cnf.StackName) {
                process.env.ASSET_BUCKET = `${cnf.StackName}-${process.env.AWS_ACCOUNT_ID}-${process.env.AWS_DEFAULT_REGION}`;
            }

            cnf.bucket = process.env.ASSET_BUCKET;

            if (!cnf.bucket) throw new Error('ASSET_BUCKET Required');
        }

        cnf.url = 'http://localhost:2001';
        cnf.SigningSecret = process.env.SigningSecret || '123';

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!cnf.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!cnf.silent) console.error('ok - set env StackName: test');
                cnf.Stack = 'test';
                cnf.StackName = 'test';
            }

            if (!process.env.MAPBOX_TOKEN) {
                throw new Error('not ok - MAPBOX_TOKEN env var required');
            }

            cnf.Mapbox = process.env.MAPBOX_TOKEN;
        } catch (err) {
            throw new Error(err);
        }

        cnf.pool = false;
        let retry = 5;
        do {
            try {
                cnf.pool = createPool(cnf.postgres, {
                    typeParsers: [
                        ...createTypeParserPreset(), {
                            name: 'geometry',
                            parse: (value) => {
                                const geom = wkx.Geometry.parse(Buffer.from(value, 'hex')).toGeoJSON();

                                geom.bounds = bbox(geom);

                                return geom;
                            }
                        }
                    ]
                });

                await cnf.pool.query(sql`SELECT NOW()`);
            } catch (err) {
                cnf.pool = false;

                if (retry === 0) {
                    console.error('not ok - terminating due to lack of postgres connection');
                    return process.exit(1);
                }

                retry--;
                console.error('not ok - unable to get postgres connection');
                console.error(`ok - retrying... (${5 - retry}/5)`);
                await sleep(5000);
            }
        } while (!cnf.pool);

        if (cnf.Environment === 'aws') {
            try {
                const account = await STS.getCallerIdentity().promise();
                cnf.account = account.Account;
            } catch (err) {
                throw new Error(err);
            }
        } else {
            cnf.account = false;
        }

        return cnf;
    }

    is_aws() {
        if (this.Environment !== 'aws') throw new Err(400, null, 'Deployment must be in AWS Environment to use this endpoint');
        return true;
    }

    async confirm_sns() {
        if (this.Environment !== 'aws') return;

        try {
            for (const type of ['vectorize', 'delete']) {
                const TopicArn = `arn:aws:sns:${process.env.AWS_DEFAULT_REGION}:${this.account}:${this.StackName}-${type}`;

                const attr = await SNS.listSubscriptionsByTopic({
                    TopicArn: `arn:aws:sns:${process.env.AWS_DEFAULT_REGION}:${this.account}:${this.StackName}-${type}`
                }).promise();

                if (attr.Subscriptions[0].SubscriptionArn === 'PendingConfirmation') {
                    await SNS.subscribe({
                        TopicArn,
                        Protocol: attr.Subscriptions[0].Protocol,
                        Endpoint: attr.Subscriptions[0].Endpoint
                    }).promise();
                }
            }
        } catch (err) {
            throw new Error(err);
        }
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = Config;
