'use strict';
const { Err } = require('@openaddresses/batch-schema');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);
const jwt = require('jsonwebtoken');
const { sql } = require('slonik');
const Generic = require('@openaddresses/batch-generic');

/**
 * @class
 */
class User extends Generic {
    static _table = 'users';
    static _patch = require('../schema/req.body.PatchUser.json');
    static _res = require('../schema/res.User.json');

    /**
     * Return a list of users
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Username or Email fragment to filter by
     * @param {String} [query.access=] - User Access to filter by
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    async list(pool, query) {
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
                    username = ${user.username} OR
                    email = ${user.username};
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Login Error');
        }

        if (pgres.rows.length === 0) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        return this.deserialize(pgres.rows[0]);
    }


    static async is_auth(req) {
        if (req.user === 'internal') return true;

        if (!req.user || !req.user.access || !req.user.id) {
            throw new Err(401, null, 'Authentication Required');
        }

        if (req.user.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    static async is_admin(req) {
        if (req.user === 'internal') return true;

        await this.is_auth(req);

        if (req.user.access !== 'admin') {
            throw new Err(401, null, 'Admin token required');
        }

        return true;
    }

    async verify(token) {
        if (!token) throw new Err(400, null, 'token required');

        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                SELECT
                    uid
                FROM
                    users_reset
                WHERE
                    expires > NOW()
                    AND token = ${token}
                    AND action = 'verify'
            `);
        } catch (err) {
            throw new Err(500, err, 'User Verify Error');
        }

        if (pgres.rows.length !== 1) {
            throw new Err(401, null, 'Invalid or Expired Verify Token');
        }

        try {
            await this.config.pool.query(sql`
                DELETE FROM users_reset
                    WHERE uid = ${pgres.rows[0].uid}
            `);

            await this.config.pool.query(sql`
                UPDATE users
                    SET validated = True
                    WHERE id = ${pgres.rows[0].uid}
            `);

            return {
                status: 200,
                message: 'User Verified'
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to verify user');
        }
    }

    async reset(user) {
        if (!user.token) throw new Err(400, null, 'token required');
        if (!user.password) throw new Err(400, null, 'password required');

        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                SELECT
                    uid
                FROM
                    users_reset
                WHERE
                    expires > NOW()
                    AND token = ${user.token}
                    AND action = 'reset'
            `);
        } catch (err) {
            throw new Err(500, err, 'User Reset Error');
        }

        if (pgres.rows.length !== 1) {
            throw new Err(401, null, 'Invalid or Expired Reset Token');
        }

        const uid = pgres.rows[0].uid;

        try {
            const userhash = await bcrypt.hash(user.password, 10);

            await this.config.pool.query(sql`
                UPDATE users
                    SET
                        password = ${userhash},
                        validated = True

                    WHERE
                        id = ${uid}
            `);

            await this.config.pool.query(sql`
                DELETE FROM users_reset
                    WHERE uid = ${uid}
            `);

            return {
                status: 200,
                message: 'User Reset'
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to reset user\'s password');
        }
    }

    /**
     * Given a username or email, generate a password reset or validation email
     *
     * @param {string} user username or email to reset
     * @param {string} [action=reset] 'reset' or 'verify'
     */
    async forgot(user, action) {
        if (!user || !user.length) throw new Err(400, null, 'user must not be empty');
        if (!action) action = 'reset';

        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                SELECT
                    id,
                    username,
                    email
                FROM
                    users
                WHERE
                    username = ${user}
                    OR email = ${user}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (pgres.rows.length !== 1) return;
        const u = pgres.rows[0];
        u.id = parseInt(u.id);

        try {
            await this.config.pool.query(sql`
                DELETE FROM
                    users_reset
                WHERE
                    uid = ${u.id}
                    AND action = ${action}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        try {
            const buffer = await randomBytes(40);

            await this.config.pool.query(sql`
                INSERT INTO
                    users_reset (uid, expires, token, action)
                VALUES (
                    ${u.id},
                    NOW() + interval '1 hour',
                    ${buffer.toString('hex')},
                    ${action}
                )
            `);

            return {
                uid: u.id,
                username: u.username,
                email: u.email,
                token: buffer.toString('hex')
            };
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }
    }

    async commit(pool) {
        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                UPDATE users
                    SET
                        access = ${user.access},
                        validated = ${user.validated}
                    WHERE
                        id = ${uid}
                    RETURNING *
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return this;
    }

    async login(user) {
        if (!user.username) throw new Err(400, null, 'username required');
        if (!user.password) throw new Err(400, null, 'password required');

        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                SELECT
                    id,
                    username,
                    access,
                    email,
                    password,
                    validated
                FROM
                    users
                WHERE
                    username = ${user.username} OR
                    email = ${user.username};
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Login Error');
        }

        if (pgres.rows.length === 0) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!await bcrypt.compare(user.password, pgres.rows[0].password)) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!pgres.rows[0].validated) {
            throw new Err(403, null, 'User has not confirmed email');
        }

        if (pgres.rows[0].access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        const token = jwt.sign({
            u: parseInt(pgres.rows[0].id)
        }, this.config.SigningSecret);

        return {
            uid: parseInt(pgres.rows[0].id),
            username: pgres.rows[0].username,
            access: pgres.rows[0].access,
            email: pgres.rows[0].email,
            token: token
        };
    }

    async generate(pool, user) {
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
                    'user'
                ) RETURNING *
            `);

            this.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to register user');
        }
    }
}

module.exports = User;
