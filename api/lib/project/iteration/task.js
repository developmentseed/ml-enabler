'use strict';

const Err = require('../../error');
const { sql } = require('slonik');
const Generic = require('../../generic');
const schema = require('../../../schema/res.Task.json');
const AWS = require('aws-sdk');
const batch = new AWS.Batch({ region: process.env.AWS_DEFAULT_REGION });
const cwl = new AWS.CloudWatchLogs({ region: process.env.AWS_DEFAULT_REGION });
const jwt = require('jsonwebtoken');

/**
 * @class
 */
class ProjectTask extends Generic {
    static _table = 'tasks';

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
                    batch_id,
                    log_link
                FROM
                    tasks
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
            batch_id: this.batch_id,
            log_link: this.log_link
        };
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE tasks
                    SET
                        batch_id    = ${this.batch_id},
                        log_link    = ${this.log_link},
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Task');
        }
    }

    async logs() {
        if (!this.log_link) throw new Err(400, null, 'Task did not save log_link');

        let logs = await cwl.getLogEvents({
            logGroupName: '/aws/batch/job',
            logStreamName: this.log_link
        }).promise();

        let line = 0;
        logs = logs.events.map((log) => {
            return {
                id: line++,
                message: event.timestamp,
                message: event.message
            };
        });

        return {
            logs: logs
        };
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
     * @param {String} opts.name Name of Batch Job
     * @param {String} opts.type Type
     * @param {Number} opts.iter_id Iteration ID
     * @param {Object[]} opts.environment AWS Batch Environment Override
     */
    static async batch(config, opts) {
        let jobDef;
        let jobQueue = config.StackName + '-queue';

        if (!opts.environment) opts.environent = [];

        if (opts.type === 'ecr') {
            jobDef = config.StackName + '-build-job';
        } else {
            throw new Err(400, null, 'Unsupported task type');
        }

        const task = await ProjectTask.generate(config.pool, {
            iter_id: opts.iter_id,
            type: opts.type
        });

        const token = jwt.sign({
            t: 'i', // Internal
        }, config.SigningSecret);

        opts.environment.push({
            name: 'TOKEN',
            value: token
        });

        opts.environment.push({
            name: 'TASK_ID',
            value: task.id
        });

        let job;
        try {
            job = await batch.submitJob({
                jobName: opts.name,
                jobQueue: jobQueue,
                jobDefinition: jobDef,
                containerOverrides: {
                    environment: opts.environment
                },
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to submit job');
        }

        task.patch({
            batch_id: job.jobId
        });

        await task.commit(config.pool);
    }
}

module.exports = ProjectTask;
