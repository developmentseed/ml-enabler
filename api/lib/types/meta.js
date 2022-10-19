import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class Meta extends Generic {
    static _table = 'meta';

    /**
     * List & Filter Meta
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} query - Query object
     * @param {String} [query.filter=] - Filter tokens by name
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page to return
     */
    static async list(pool, query) {
        if (!query) query = {};
        if (!query.filter) query.filter = '';
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    key,
                    created,
                    updated,
                    value
                FROM
                    meta
                WHERE
                    key ~ ${query.filter}
                ORDER BY
                    key DESC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres.rows);
        } catch (err) {
            throw new Err(500, err, 'Failed to list meta');
        }
    }

    /**
     * Commit a meta to the database
     *
     * @param {Pool} pool - Postgres Pool instance
     */
    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE meta
                    SET
                        value = ${JSON.stringify(this.value)},
                        updated = NOW()
                    WHERE
                        key = ${this.key}
            `);
        } catch (err) {
            throw new Err(500, err, 'failed to save meta');
        }
    }

    /**
     * Get a meta
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {String} key - Metadata key
     *
     * @returns {meta}
     */
    static async from(pool, key) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    meta
                WHERE
                    key = ${key}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to obtain meta');
        }

        if (!pgres.rows.length) {
            throw new Err(404, null, 'Meta not found');
        }

        return this.deserialize(pool, pgres.rows[0]);
    }

    /**
     * Delete a meta
     *
     * @param {Pool} pool - Postgres Pool instance
     *
     * @returns {meta}
     */
    async delete(pool) {
        try {
            await pool.query(sql`
                DELETE FROM meta
                    WHERE key = ${this.key}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate meta');
        }
    }
}
