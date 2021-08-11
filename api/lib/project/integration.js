'use strict';

const Err = require('../error');
const { sql } = require('slonik');
const Generic = require('../generic');

/**
 * @class
 */
class ProjectIntegration extends Generic {
    constructor() {
        this._table = 'integrations';

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../schema/req.body.PatchIntegration.json').properties);

        super();
    }

    /**
     * Return a list of integrations for a given project
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
                    created,
                    updated,
                    integration,
                    name,
                    url
                FROM
                    integrations
                WHERE
                    name ~ ${query.filter}
                ORDER BY
                    ${sql.identifier(['integrations', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Integration Error');
        }

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            integrations: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    created: parseInt(row.created),
                    updated: parseInt(row.updated),
                    integration: row.integration,
                    name: row.name,
                    url: row.url,
                };
            })
        };
    }

    deserialize(dbrow) {
        dbrow.id = parseInt(dbrow.id);
        dbrow.pid = parseInt(dbrow.pid);
        dbrow.created = parseInt(dbrow.created);
        dbrow.updated = parseInt(dbrow.updated);
        dbrow.tile_zoom = parseInt(dbrow.tile_zoom);
        dbrow.imagery_id = parseInt(dbrow.imagery_id);

        const iter = new ProjectIntegration();

        for (const key of Object.keys(dbrow)) {
            iter[key] = dbrow[key];
        }

        return iter;
    }


    serialize() {
        return {
            id: this.id,
            pid: this.pid,
            created: this.created,
            updated: this.updated,
            integration: row.integration,
            name: row.name,
            url: row.url,
        };
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE integrations
                    SET
                        integration = ${this.integration},
                        name = ${this.name},
                        url = ${this.url},
                        auth = ${this.auth},
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Integration');
        }
    }

    static async generate(pool, iter) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO integrations (
                    pid,
                    integration,
                    name,
                    url,
                    auth
                ) VALUES (
                    ${iter.pid},
                    ${iter.integration},
                    ${iter.name},
                    ${iter.url},
                    ${iter.auth}
                ) RETURNING *
            `);

            return this.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Integration');
        }
    }
}

module.exports = ProjectIntegration;
