import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * Class representing rows in projects table
 *
 * @class
 */
export default class Project extends Generic {
    static _table = 'projects';

    /**
     * Return a list of Projects
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Name to filter by
     * @param {boolean} [query.archived=false] - Only show archived projects
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     *
     * @returns {Object}
     */
    static async list(pool, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';
        if (!query.archived) query.archived = false;

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
                    projects.id,
                    projects.created,
                    projects.updated,
                    projects.name,
                    projects.source,
                    projects.archived,
                    projects.project_url,
                    projects.access,
                    projects.repo
                FROM
                    projects,
                    projects_access
                WHERE
                    projects.name ~ ${query.filter}
                    AND projects.archived = ${query.archived}
                    AND (
                        projects.access = 'public'
                        OR (
                            projects_access.uid = ${query.uid}
                            AND projects_access.pid = projects.id
                        )
                    )
                GROUP BY
                    projects.id
                ORDER BY
                    ${sql.identifier(['projects', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return this.deserialize_list(pgres);
    }

    /**
     * Return an individual Project and if an optional uid parameter is provided,
     * only return the project if the user has access to it
     *
     * @param {Pool}    pool    Instantiated Postgres Pool
     * @param {Number}  id      Project ID
     * @param {Number}  [uid]   Optional User ID
     *
     * @returns {Project}
     */
    static async from(pool, id, uid) {
        if (!uid) return super.from(pool, id);

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    projects.id,
                    projects.created,
                    projects.updated,
                    projects.name,
                    projects.source,
                    projects.archived,
                    projects.project_url,
                    projects.access,
                    projects.tags,
                    projects.notes,
                    projects.repo
                FROM
                    projects,
                    projects_access
                WHERE
                    projects.id = ${id}
                    AND (
                        projects.access = 'public'
                        OR (
                            projects_access.uid = ${uid}
                            AND projects_access.pid = projects.id
                        )
                    )
                GROUP BY
                    projects.id
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (!pgres.rows.length) throw new Err(404, null, 'Project does not exist or user does not have access');

        return this.deserialize(pool, pgres);
    }
}
