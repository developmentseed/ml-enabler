'use strict';

const Err = require('../error');
const { sql } = require('slonik');

/**
 * @class
 */
class ProjectAccess {
    constructor() {
        this.id = false;
        this.uid = false;
        this.pid = false;
        this.access = false;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../schema/req.body.PatchProjectAccess.json').properties);
    }

    static deserialize(dbrow) {
        dbrow.id = parseInt(dbrow.id);

        const prj_access = new ProjectAccess();

        for (const key of Object.keys(dbrow)) {
            prj_access[key] = dbrow[key];
        }

        return prj_access;
    }

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
                    pa.id,
                    pa.uid,
                    u.username,
                    pa.access
                FROM
                    projects_access pa
                        LEFT JOIN users u
                        ON pa.uid = users.id
                WHERE
                    u.username ~ ${query.filter}
                GROUP BY
                    pa.id
                ORDER BY
                    ${sql.identifier(['projects_access', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Project Access Error');
        }

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            access: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    username: row.username,
                    pid: parseInt(row.pid),
                    uid: parseInt(row.uid),
                    access: row.access
                };
            })
        };
    }

    serialize() {
        return {
            id: parseInt(this.id),
            access: this.access,
            pid: parseInt(this.pid),
            uid: parseInt(this.uid),
        };
    }

    static async from(pool, id) {
        try {
            const pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    projects_access
                WHERE
                    id = ${id}
            `);

            if (!pgres.rows.length) {
                throw new Err(404, null, 'Project Access not found');
            }
            return ProjectAccess.serialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to load project access');
        }
    }

    static async from_alt(pool, pid, uid) {
        try {
            const pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    projects_access
                WHERE
                    uid = ${uid}
                    AND pid = ${pid}
            `);

            if (!pgres.rows.length) {
                throw new Err(404, null, 'Project Access not found');
            }
            return ProjectAccess.serialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to load project access');
        }
    }

    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE projects_access
                    SET
                        access      = ${this.access}
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Project Access');
        }
    }

    static async generate(pool, access) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO projects_access (
                    access,
                    pid,
                    uid
                ) VALUES (
                    ${access.access},
                    ${access.pid},
                    ${access.uid}
                ) RETURNING *
            `);

            return ProjectAccess.deserialize(pgres.rows[0]);
        } catch (err) {
            if (err.originalError && err.originalError.code && err.originalError.code === '23505') {
                throw new Err(400, null, 'Project Access for that user already exists');
            }

            throw new Err(500, err, 'Failed to generate Project Access');
        }
    }
}

module.exports = ProjectAccess;
