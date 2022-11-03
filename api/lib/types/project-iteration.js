import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class ProjectIteration extends Generic {
    static _table = 'iterations';

    /**
     * Return a list of iterations for a given project
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} pid Project ID to access
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Name to filter by
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, pid, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';

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
                    hint,
                    created,
                    updated,
                    version,
                    docker_link,
                    model_link,
                    checkpoint_link,
                    tfrecord_link,
                    save_link,
                    gitsha
                FROM
                    iterations
                WHERE
                    pid = ${pid}
                    AND version ~ ${query.filter}
                ORDER BY
                    ${sql.identifier(['iterations', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Integration Error');
        }

        return this.deserialize_list(pgres);
    }

    /**
     * Return the last iteration by SemVer
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     * @param {Number} pid - Project ID
     */
    static async latest(pool, pid) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    iterations
                WHERE
                    pid = ${pid}
                ORDER BY
                    string_to_array(version, '.')::int[] DESC
                LIMIT 1
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to load latest Iteration');
        }

        if (!pgres.rows.length) throw new Err(400, null, 'Project does not contain iterations');

        return ProjectIteration.deserialize(pool, pgres);
    }
}
