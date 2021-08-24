'use strict';

const Err = require('../../error');
const { sql } = require('slonik');
const Generic = require('../../generic');
const schema = require('../../../schema/res.Task.json');
const AWS = require('aws-sdk');
const batch = new AWS.Batch({ region: process.env.AWS_DEFAULT_REGION });

/**
 * @class
 */
class ProjectTask extends Generic {
    static _table = 'imagery';

    constructor() {
        super();

        this._table = ProjectTask._table;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../../schema/req.body.PatchTask.json').properties);
    }

    /**
     * Return a list of tasks for a given project
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} pid Project ID to access
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, pid, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

        if (!query.sort) query.sort = 'created';
        if (!query.order || query.order === 'asc') {
            query.order = sql`asc`;
        } else {
            query.order = sql`desc`;
        }

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    id,
                    iter_id,
                    type,
                    created,
                    updated,
                    batch_id
                FROM
                    tasks
                WHERE
                    type ~ ${query.filter}
                ORDER BY
                    ${sql.identifier(['tasks', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Tasks Error');
        }

        return ProjectTask.deserialize(pgres.rows);
    }

    serialize() {
        return {
            id: this.id,
            created: this.created,
            updated: this.updated,
            iter_id: this.pid,
            type: this.type,
            batch_id: this.batch_id
        };
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE tasks
                    SET
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Task');
        }
    }

    static async generate(pool, task) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO tasks (
                    iter_id,
                    type,
                    batch_id
                ) VALUES (
                    ${task.iter_id},
                    ${task.type},
                    ${task.batch_id}
                ) RETURNING *
            `);

            return ProjectTask.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Task');
        }
    }

    static batch(pool) {
        let job;
        try {
            job = await batch.submitJob({
                jobName: CONFIG.EnvironmentConfig.STACK + 'ecr-build',
                jobQueue: CONFIG.EnvironmentConfig.STACK + '-queue',
                jobDefinition: CONFIG.EnvironmentConfig.STACK + '-build-job',
                containerOverrides: {
                    "environment": [{
                        name: 'MODEL',
                        value: CONFIG.EnvironmentConfig.ASSET_BUCKET + '/' + key,
                    }]
                },
            }).promise();
        } catch (err) {

        }

        Task.generate(pool, {
            pid:
            type: 'ecr',
            batch_id: job.jobId
        });
    }
}

module.exports = ProjectTask;
