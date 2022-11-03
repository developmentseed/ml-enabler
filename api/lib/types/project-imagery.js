import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class ProjectImagery extends Generic {
    static _table = 'imagery';

    /**
     * Return a list of imagery sources for a given project
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
        try { pgres = await pool.query(sql` SELECT
                    count(*) OVER() AS count,
                    imagery.id,
                    imagery.name,
                    imagery.url,
                    imagery.fmt,
                    imagery.created,
                    imagery.updated
                FROM
                    imagery
                WHERE
                    pid = ${pid}
                    AND imagery.name ~ ${query.filter}
                ORDER BY
                    ${sql.identifier(['imagery', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Imagery Error');
        }

        return this.deserialize_list(pgres);
    }
}
