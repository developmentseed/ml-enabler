'use strict';

const Err = require('./error');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);
const jwt = require('jsonwebtoken');
const { sql } = require('slonik');

/**
 * @class
 */
class User {
    constructor(config) {
        this.config = config;

        this.attrs = Object.keys(require('../schema/req.body.PatchUser.json').properties);
    }

    async is_auth(req) {
        if (!req.auth || !req.auth.access || !req.auth.uid) {
            throw new Err(401, null, 'Authentication Required');
        }

        if (req.auth.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    async is_admin(req) {
        await this.is_auth(req);

        if (req.auth.access !== 'admin') {
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

    async patch(uid, patch) {
        const user = await this.user(uid);

        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                user[attr] = patch[attr];
            }
        }

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

        return {
            id: parseInt(pgres.rows[0].id),
            username: pgres.rows[0].username,
            email: pgres.rows[0].email,
            validated: pgres.rows[0].validated,
            access: pgres.rows[0].access
        };
    }

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
    async list(query) {
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
            pgres = await this.config.pool.query(sql`
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

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            users: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    username: row.username,
                    validated: row.validated,
                    email: row.email,
                    access: row.access
                };
            })
        };
    }

    async user(uid) {
        let pgres;
        try {
            pgres = await this.config.pool.query(sql`
                SELECT
                    id,
                    username,
                    validated,
                    access,
                    email
                FROM
                    users
                WHERE
                    id = ${uid}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (pgres.rows.length === 0) {
            throw new Error(404, null, 'Failed to retrieve user');
        }

        return {
            uid: parseInt(pgres.rows[0].id),
            username: pgres.rows[0].username,
            email: pgres.rows[0].email,
            validated: pgres.rows[0].validated,
            access: pgres.rows[0].access
        };
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

    async register(user) {
        if (!user.username) throw new Err(400, null, 'username required');
        if (!user.email) throw new Err(400, null, 'email required');

        try {
            const pgres = await this.config.pool.query(sql`
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

            const row = pgres.rows[0];

            return {
                id: parseInt(row.id),
                username: row.username,
                email: row.email,
                validated: row.validated,
                access: row.access
            };
        } catch (err) {
            if (err.originalError && err.originalError.code && err.originalError.code === '23505') {
                throw new Err(400, null, 'User already exists');
            }

            throw new Err(500, err, 'Failed to register user');
        }
    }
}

module.exports = User;
