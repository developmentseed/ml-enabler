import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class ProjectIntegration extends Generic {
    static _table =  'integrations';
    static _patch = require('../../schema/req.body.PatchIntegration.json');
    static _res = require('../../schema/res.Integration.json');

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
