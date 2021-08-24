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

    /**
     * Create a new batch task
     *
     * @param {Config} config Config object
     * @param {Object} opts Options Object
     * @param {String} opts.type Type
     * @param {Number} opts.iter_id Iteration ID
     * @param {Object[]} opts.environment AWS Batch Environment Override
     */
    static async batch(config, opts) {
        let jobName, jobDef;
        let jobQueue = config.StackName + '-queue';

        if (!opts.environment) opts.environent = [];

        if (type === 'ecr') {
            jobName = config.StackName + 'ecr-build';
            jobDef = config.StackName + '-build-job';
        } else {
            throw new Err(400, null, 'Unsupported task type');
        }

        let job;
        try {
            job = await batch.submitJob({
                jobName: jobName,
                jobQueue: jobQueue,
                jobDefinition: jobDef,
                containerOverrides: {
                    environment: opts.environment
                },
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to submit job');
        }

        await Task.generate(config.pool, {
            iter_id: opts.iter_id,
            type: opts.type,
            batch_id: job.jobId
        });
    }
}

module.exports = ProjectTask;
