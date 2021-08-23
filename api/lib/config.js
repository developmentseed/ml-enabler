'use strict';

const AWS = require('aws-sdk');
const { sql, createPool } = require('slonik');
const Err = require('./error');

class Config {
    constructor() {

    }

    static async env(args = {}) {
        const cnf = new Config();

        cnf.args = args;

        cnf.silent = !!args.silent;

        if (!process.env.GitSha) throw new Error('GitSha Required');

        cnf.postgres = args.postgres || process.env.POSTGRES || 'postgres://postgres@localhost:5432/mlenabler';
        cnf.Environment = process.env.ENVIRONMENT || 'docker';

        if (cnf.Environment === 'aws') {
            cnf.bucket = process.env.ASSET_BUCKET;
            if (!cnf.bucket) throw new Error('ASSET_BUCKET Required');
        }

        cnf.url = 'http://localhost:2001';
        cnf.signing_secret = process.env.SIGNING_SECRET || '123';

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!cnf.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!cnf.silent) console.error('ok - set env StackName: test');
                cnf.Stack = 'test';

                cnf.octo = false;
                cnf.CookieSecret = '123';
                cnf.SharedSecret = '123';
            } else {
                const secrets = await Config.secret('Batch');

                cnf.CookieSecret = secrets.CookieSecret;
                cnf.SharedSecret = process.env.SharedSecret;
                cnf.Stack = process.env.StackName;
            }

            if (!process.env.MAPBOX_TOKEN) {
                throw new Error('not ok - MAPBOX_TOKEN env var required');
            }

            if (!process.env.GithubSecret) {
                if (!cnf.silent) console.error('ok - set env GithubSecret: no-secret');
                process.env.GithubSecret = 'no-secret';
            }
        } catch (err) {
            throw new Error(err);
        }

        cnf.pool = false;
        let retry = 5;
        do {
            try {
                cnf.pool = createPool(cnf.postgres);

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

        return cnf;
    }

    static secret(secretName) {
        return new Promise((resolve, reject) => {
            const client = new AWS.SecretsManager({
                region: process.env.AWS_DEFAULT_REGION
            });

            client.getSecretValue({
                SecretId: secretName
            }, (err, data) => {
                if (err) return reject(err);

                try {
                    return resolve(JSON.parse(data.SecretString));
                } catch (err) {
                    return reject(err);
                }
            });
        });
    }

    is_aws() {
        if (this.Environment !== 'aws') throw new Err(400, null, 'Deployment must be in AWS Environment to use this endpoint');
        return true;
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = Config;
