const { Err } = require('@openaddresses/batch-schema');
const { sql } = require('slonik');
const Generic = require('../../generic');

/**
 * @class
 */
class Submission extends Generic {
    static _table = 'aoi_submission';
    static _res = require('../../../schema/res.Submission.json');

    /**
     * Return a list of aoi submissions for the given iteration
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} iteration Iteration to list submissions for
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, iteration, query) {
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
                    aoi_id,
                    created
                FROM
                    aoi_submission
                WHERE
                    iter_id = ${iteration}
                ORDER BY
                    ${sql.identifier(['aoi_submission', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Tasks Error');
        }

        return this.deserialize(pgres.rows, 'submissions');
    }

    static async generate(pool, submission) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO aoi_submission (
                    aoi_id,
                    iter_id
                ) VALUES (
                    ${submission.aoi_id || null},
                    ${submission.iter_id}
                ) RETURNING *
            `);

            return this.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Task');
        }
    }
}

module.exports = Submission;
