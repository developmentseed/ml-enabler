import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import moment from 'moment';

const batch = new AWS.Batch({ region: process.env.AWS_DEFAULT_REGION });
const cwl = new AWS.CloudWatchLogs({ region: process.env.AWS_DEFAULT_REGION });

/**
 * @class
 */
export default class ProjectTask extends Generic {
    static _table = 'tasks';

    /**
     * Return a list of tasks for a given project
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} iteration Iteration to list tasks for
     *
     * @param {Object} query - Query Object
     * @param {String} [query.type] - Filter by specific task type
     * @param {String} [query.before] - Only show tasks before the given date
     * @param {String} [query.after] - Only show jobs after the given date
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, iteration, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

        if (query.after) {
            try {
                query.after = moment(query.after);
            } catch (err) {
                throw new Err(400, err, 'after param is not recognized as a valid date');
            }
        } else {
            query.after = null;
        }

        if (query.before) {
            try {
                query.before = moment(query.before);
            } catch (err) {
                throw new Err(400, err, 'before param is not recognized as a valid date');
            }
        } else {
            query.before = null;
        }

        if (!query.type) query.type = null;
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
                WHERE
                    iter_id = ${iteration}
                    AND (${query.type}::TEXT IS NULL OR type = ${query.type}::TEXT)
                    AND (${query.after ? query.after.toDate().toISOString() : null}::TIMESTAMP IS NULL OR tasks.created > ${query.after ? query.after.toDate().toISOString() : null}::TIMESTAMP)
                    AND (${query.before ? query.before.toDate().toISOString() : null}::TIMESTAMP IS NULL OR tasks.created < ${query.before ? query.before.toDate().toISOString() : null}::TIMESTAMP)
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

        let logs;
        try {
            logs = await cwl.getLogEvents({
                logGroupName: '/aws/batch/job',
                logStreamName: this.log_link
            }).promise();
        } catch (err) {
            throw new Err(400, err, 'Failed to obtain logs');
        }

        let line = 0;
        logs = logs.events.map((event) => {
            return {
                id: line++,
                timestamp: event.timestamp,
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
                    type
                ) VALUES (
                    ${task.iter_id},
                    ${task.type}
                ) RETURNING *
            `);

            return ProjectTask.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Task');
        }
    }

    async delete(pool) {
        if (this.batch_id) {
            try {
                await batch.cancelJob({
                    jobId: this.batch_id,
                    reason: 'User Requested'
                }).promise();
            } catch (err) {
                throw new Err(500, err, 'Failed to cancel job');
            }
        }

        return await super.delete(pool);
    }

    static async from(pool, id) {
        const task = await super.from(pool, id);

        if (task.batch_id) {
            const res = await batch.describeJobs({
                jobs: [task.batch_id]
            }).promise();

            if (res.jobs.length === 1) {
                task.status = res.jobs[0].status;
                task.statusReason = res.jobs[0].statusReason;
            } else {
                task.status = 'UNKNOWN';
                task.statusReason = 'AWS does not report this task';
            }
        }

        return task;
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
        const jobQueue = config.StackName + '-queue';

        if (!opts.environment) opts.environent = [];

        if (opts.type === 'ecr') {
            jobDef = config.StackName + '-build-job';
        } else if (opts.type === 'pop') {
            jobDef = config.StackName + '-pop-job';
        } else if (opts.type === 'vectorize') {
            jobDef = config.StackName + '-vectorize-job';
        } else {
            throw new Err(400, null, 'Unsupported task type');
        }

        const task = await ProjectTask.generate(config.pool, {
            iter_id: opts.iter_id,
            type: opts.type
        });

        const token = jwt.sign({
            t: 'i' // Internal
        }, config.SigningSecret);

        opts.environment.push({
            name: 'TOKEN',
            value: token
        });

        opts.environment.push({
            name: 'TASK_ID',
            value: String(task.id)
        });

        try {
            const job = await batch.submitJob({
                jobName: opts.name,
                jobQueue: jobQueue,
                jobDefinition: jobDef,
                containerOverrides: {
                    environment: opts.environment
                }
            }).promise();

            task.batch_id = job.jobId;
            return await task.commit(config.pool);
        } catch (err) {
            throw new Err(500, err, 'Failed to submit job');
        }
    }
}
