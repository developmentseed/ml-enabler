import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class ProjectAccess extends Generic {
    static _table = 'projects_access';

    /**
     * Return a list of users that can access a given project
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
                    pa.id,
                    pa.uid,
                    u.username,
                    pa.access,
                    pa.created,
                    pa.updated
                FROM
                    projects_access pa
                        INNER JOIN users u
                        ON pa.uid = u.id
                WHERE
                    pid = ${pid}
                    AND u.username ~ ${query.filter}
                GROUP BY
                    pa.id,
                    u.username
                ORDER BY
                    ${sql.identifier(['pa', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Project Access Error');
        }

        return this.deserialize_list(pgres);
    }

    static async from_alt(pool, pid, uid) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    projects_access
                WHERE
                    uid = ${uid}
                    AND pid = ${pid}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to load project access');
        }

        if (!pgres.rows.length) {
            throw new Err(404, null, 'Project Access not found');
        }

        return ProjectAccess.serialize(pgres.rows[0]);
    }
}
