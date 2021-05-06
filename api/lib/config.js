'use strict';

const AWS = require('aws-sdk');
const pkg = require('../package.json');

class Config {
    static async env(args = {}) {
        this.limits = args.limit || {
            exports: 300
        };

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                console.error('ok - set env StackName: test');
                process.env.StackName = 'test';

                this.octo = false;
                this.CookieSecret = '123';
                this.SharedSecret = '123';
            } else {
                const secrets = await Config.secret('Batch');

                this.CookieSecret = secrets.CookieSecret;
                this.SharedSecret = process.env.SharedSecret;
            }

            if (!process.env.MAPBOX_TOKEN) {
                throw new Error('not ok - MAPBOX_TOKEN env var required');
            }

            if (!process.env.GithubSecret) {
                console.error('ok - set env GithubSecret: no-secret');
                process.env.GithubSecret = 'no-secret';
            }
        } catch (err) {
            throw new Error(err);
        }

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

module.exports = Config;
