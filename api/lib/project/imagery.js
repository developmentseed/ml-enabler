'use strict';

const Err = require('../error');
const { sql } = require('slonik');
const Generic = require('../generic');

/**
 * @class
 */
class ProjectImagery extends Generic {
    constructor() {
        super();

        this.id = false;
        this.pid = false;
        this.name = false;
        this.url = false;
        this.created = false;
        this.updated = false;
        this.fmt = false;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../schema/req.body.PatchImagery.json').properties);
    }

    static deserialize(dbrow) {
        dbrow.id = parseInt(dbrow.id);
        dbrow.pid = parseInt(dbrow.pid);
        dbrow.created = parseInt(dbrow.created);
        dbrow.updated = parseInt(dbrow.updated);

        const imagery = new ProjectImagery();

        for (const key of Object.keys(dbrow)) {
            imagery[key] = dbrow[key];
        }

        return imagery;
    }

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
        try {
            pgres = await pool.query(sql`
                SELECT
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
                    imagery.name ~ ${query.filter}
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

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            imagery: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    created: parseInt(row.created),
                    updated: parseInt(row.updated),
                    name: row.name,
                    url: row.url,
                    fmt: row.fmt
                };
            })
        };
    }

    serialize() {
        return {
            id: this.id,
            created: this.created,
            updated: this.updated,
            pid: this.pid,
            name: this.name,
            url: this.url,
            fmt: this.fmt
        };
    }

    static async from(pool, id) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    imagery
                WHERE
                    id = ${id}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to load imagery');
        }

        if (!pgres.rows.length) {
            throw new Err(404, null, 'Imagery not found');
        }

        return ProjectImagery.deserialize(pgres.rows[0]);
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE imagery
                    SET
                        name        = ${this.name},
                        url         = ${this.url},
                        fmt         = ${this.fmt},
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Imagery');
        }
    }

    static async generate(pool, imagery) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO imagery (
                    pid,
                    name,
                    url,
                    fmt
                ) VALUES (
                    ${imagery.pid},
                    ${imagery.name},
                    ${imagery.url},
                    ${imagery.fmt}
                ) RETURNING *
            `);

            return ProjectImagery.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Imagery');
        }
    }

    async delete(pool) {
        try {
            await pool.query(sql`
                DELETE FROM imagery
                    WHERE
                        id = ${this.id}
            `);

            return true;
        } catch (err) {
            throw new Err(500, err, 'Failed to delete Imagery');
        }
    }
}

module.exports = ProjectImagery;
