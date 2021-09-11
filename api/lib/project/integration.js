'use strict';

const Err = require('../error');
const { sql } = require('slonik');
const Generic = require('../generic');

/**
 * @class
 */
class ProjectIntegration extends Generic {
    static _table =  'integrations';

    constructor() {
        super();

        this._table = ProjectIntegration._table;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../schema/req.body.PatchIntegration.json').properties);
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
                    pid = ${pid}
                    AND name ~ ${query.filter}
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

        return ProjectIntegration.deserialize(pgres.rows);
    }

    serialize() {
        return {
            id: this.id,
            pid: this.pid,
            created: this.created,
            updated: this.updated,
            integration: this.integration,
            name: this.name,
            url: this.url,
        };
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE integrations
                    SET
                        integration = ${this.integration},
                        name        = ${this.name},
                        url         = ${this.url},
                        auth        = ${this.auth},
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

            return ProjectIntegration.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Integration');
        }
    }
}

module.exports = ProjectIntegration;