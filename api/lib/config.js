'use strict';

const AWS = require('aws-sdk');
const { sql, createPool } = require('slonik');

class Config {
    static async env(args = {}) {
        this.args = args;

        this.silent = !!args.silent;

        this.bucket = process.env.ASSET_BUCKET;

        this.postgres = args.postgres || process.env.POSTGRES || 'postgres://postgres@localhost:5432/mlenabler';
        this.Environment = process.env.ENVIRONMENT || 'docker';

        this.url = 'http://localhost:2001';
        this.signing_secret = process.env.SIGNING_SECRET || '123';

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!this.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!this.silent) console.error('ok - set env StackName: test');
                this.Stack = 'test';

                this.octo = false;
                this.CookieSecret = '123';
                this.SharedSecret = '123';
            } else {
                const secrets = await Config.secret('Batch');

                this.CookieSecret = secrets.CookieSecret;
                this.SharedSecret = process.env.SharedSecret;
                this.Stack = process.env.StackName;
            }

            if (!process.env.MAPBOX_TOKEN) {
                throw new Error('not ok - MAPBOX_TOKEN env var required');
            }

            if (!process.env.GithubSecret) {
                if (!this.silent) console.error('ok - set env GithubSecret: no-secret');
                process.env.GithubSecret = 'no-secret';
            }
        } catch (err) {
            throw new Error(err);
        }

        this.pool = false;
        let retry = 5;
        do {
            try {
                this.pool = createPool(this.postgres);

                await this.pool.query(sql`SELECT NOW()`);
            } catch (err) {
                this.pool = false;

                if (retry === 0) {
                    console.error('not ok - terminating due to lack of postgres connection');
                    return process.exit(1);
                }

                retry--;
                console.error('not ok - unable to get postgres connection');
                console.error(`ok - retrying... (${5 - retry}/5)`);
                await sleep(5000);
            }
        } while (!this.pool);

        return this;
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
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = Config;
