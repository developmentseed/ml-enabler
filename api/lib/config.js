'use strict';

const CP = require('child_process');
const { sql, createPool, createTypeParserPreset } = require('slonik');
const Err = require('./error');
const wkx = require('wkx');
const bbox = require('@turf/bbox').default;

/** 
 * @class
 */
class Config {
    static async env(args = {}) {
        const cnf = new Config();

        cnf.args = args;

        cnf.silent = !!args.silent;

        if (!process.env.GitSha) {
            process.env.GitSha = String(CP.execSync('git rev-parse HEAD'));
        }

        cnf.postgres = args.postgres || process.env.POSTGRES || 'postgres://postgres@localhost:5432/mlenabler';
        cnf.Environment = process.env.ENVIRONMENT || 'docker';

        if (cnf.Environment === 'aws') {
            cnf.bucket = process.env.ASSET_BUCKET;
            if (!cnf.bucket) throw new Error('ASSET_BUCKET Required');

            cnf.StackName = process.env.StackName;
            cnf.Stack = process.env.StackName;
            if (!cnf.StackName) throw new Error('StackName Required');
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

        return cnf;
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
