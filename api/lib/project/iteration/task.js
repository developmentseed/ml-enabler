'use strict';

const Err = require('../../error');
const { sql } = require('slonik');
const Generic = require('../../generic');
const schema = require('../../../schema/res.Task.json');

/**
 * @class
 */
class ProjectTask extends Generic {
    static _table = 'imagery';

    constructor() {
        super();

        this._table = ProjectTask._table;

        this.id = false;
        this.iter_id = false;
        this.created = false;
        this.updated = false;
        this.type = false;
        this.batch_id = false;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../../schema/req.body.PatchTask.json').properties);
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

        return this.deserialize(pgres.rows);
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
            throw new Err(500, err, 'Failed to save Task');
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

            return ProjectTask.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Task');
        }
    }
}

module.exports = ProjectTask;
