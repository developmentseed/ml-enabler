import Err from '@openaddresses/batch-error';
import bcrypt from 'bcrypt';
import { sql } from 'slonik';
import Generic from '@openaddresses/batch-generic';

/**
 * @class
 */
export default class User extends Generic {
    static _table = 'users';

    /**
     * Return a list of users
     *
     * @param {Pool}   pool  - Instantiated Postgres Pool
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Username or Email fragment to filter by
     * @param {String} [query.access=] - User Access to filter by
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';
        if (!query.access) query.access = null;
        if (!query.org) query.org = null;

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
                    users.id,
                    users.username,
                    users.validated,
                    users.access,
                    users.email
                FROM
                    users
                WHERE
                    (users.username ~ ${query.filter} OR users.email ~* ${query.filter})
                    AND (${query.access}::TEXT IS NULL OR users.access = ${query.access})
                GROUP BY
                    users.id
                ORDER BY
                    ${sql.identifier(['users', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return this.deserialize(pgres.rows);
    }

    static async from_username(pool, username) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    users
                WHERE
                    username = ${username}
                    OR email = ${username}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Login Error');
        }

        if (pgres.rows.length === 0) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        return this.deserialize(pgres.rows[0]);
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE users
                    SET
                        access = ${this.access},
                        validated = ${this.validated}
                    WHERE
                        id = ${this.id}
                    RETURNING *
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return this;
    }

    async set_password(pool, password) {
        const userhash = await bcrypt.hash(password, 10);

        try {
            await pool.query(sql`
                UPDATE users
                    SET
                        password = ${userhash},
                        validated = True
                    WHERE
                        id = ${this.id}
                    RETURNING *
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to update User Password');
        }

        return this;
    }

    static async generate(pool, user) {
        if (!user.username) throw new Err(400, null, 'username required');
        if (!user.email) throw new Err(400, null, 'email required');
        if (!user.password) throw new Err(400, null, 'password required');

        try {
            const pgres = await pool.query(sql`
                INSERT INTO users (
                    username,
                    email,
                    password,
                    access
                ) VALUES (
                    ${user.username},
                    ${user.email},
                    ${await bcrypt.hash(user.password, 10)},
                    ${user.access || 'user'}
                ) RETURNING *
            `);

            return this.deserialize(pgres.rows[0]);
        } catch (err) {
            if (err.originalError && err.originalError.code && err.originalError.code === '23505') {
                throw new Err(400, err, 'User already exists');
            }
            throw new Err(500, err, 'Failed to register user');
        }
    }
}
