'use strict';

const Err = require('./error');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

class User {
    constructor(pool) {
        this.pool = pool;

        this.attrs = Object.keys(require('../schema/req.body.PatchUser.json').properties);
    }

    async is_auth(req) {
        if (!req.auth || !req.auth.access || !['session', 'token', 'secret'].includes(req.auth.type)) {
            throw new Err(401, null, 'Authentication Required');
        }

        if (req.auth.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    async is_level(req, level) {
        await this.is_auth(req);

        if (level === 'basic') {
            return true;
        } else if (level === 'backer' && ['backer', 'sponsor'].includes(req.auth.level)) {
            return true;
        } else if (level === 'sponsor' && req.auth.level === 'sponsor') {
            return true;
        }

        throw new Err(401, null, 'Please donate to use this feature');
    }

    async is_flag(req, flag) {
        await this.is_auth(req);

        if ((!req.auth.flags || !req.auth.flags[flag]) && req.auth.access !== 'admin' && req.auth.type !== 'secret') {
            throw new Err(401, null, `${flag} flag required`);
        }

        return true;
    }

    async is_admin(req) {
        if (!req.auth || !req.auth.access || req.auth.access !== 'admin') {
            throw new Err(401, null, 'Admin token required');
        }

        return true;
    }


    async verify(token) {
        if (!token) throw new Err(400, null, 'token required');

        let pgres;
        try {
            pgres = await this.pool.query(`
                SELECT
                    uid
                FROM
                    users_reset
                WHERE
                    expires > NOW()
                    AND token = $1
                    AND action = 'verify'
            `, [token]);
        } catch (err) {
            throw new Err(500, err, 'User Verify Error');
        }

        if (pgres.rows.length !== 1) {
            throw new Err(401, null, 'Invalid or Expired Verify Token');
        }

        try {
            await this.pool.query(`
                DELETE FROM users_reset
                    WHERE uid = $1
            `, [pgres.rows[0].uid]);

            await this.pool.query(`
                UPDATE users
                    SET validated = True
                    WHERE id = $1
            `, [pgres.rows[0].uid]);

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
            pgres = await this.pool.query(`
                SELECT
                    uid
                FROM
                    users_reset
                WHERE
                    expires > NOW()
                    AND token = $1
                    AND action = 'reset'
            `, [user.token]);
        } catch (err) {
            throw new Err(500, err, 'User Reset Error');
        }

        if (pgres.rows.length !== 1) {
            throw new Err(401, null, 'Invalid or Expired Reset Token');
        }

        const uid = pgres.rows[0].uid;

        try {
            const userhash = await bcrypt.hash(user.password, 10);

            await this.pool.query(`
                UPDATE users
                    SET
                        password = $1,
                        validated = True

                    WHERE
                        id = $2
            `, [
                userhash,
                uid
            ]);

            await this.pool.query(`
                DELETE FROM users_reset
                    WHERE uid = $1
            `, [
                uid
            ]);

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
            pgres = await this.pool.query(`
                SELECT
                    id,
                    username,
                    email
                FROM
                    users
                WHERE
                    username = $1
                    OR email = $1
            `, [user]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (pgres.rows.length !== 1) return;
        const u = pgres.rows[0];
        u.id = parseInt(u.id);

        try {
            await this.pool.query(`
                DELETE FROM
                    users_reset
                WHERE
                    uid = $1
                    AND action = $2
            `, [u.id, action]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        try {
            const buffer = await randomBytes(40);

            await this.pool.query(`
                INSERT INTO
                    users_reset (uid, expires, token, action)
                VALUES (
                    $1,
                    NOW() + interval '1 hour',
                    $2,
                    $3
                )
            `, [u.id, buffer.toString('hex'), action]);

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

    async level(email, level) {
        let pgres;
        try {
            pgres = await this.pool.query(`
                UPDATE users
                    SET
                        level = $2
                    WHERE
                        email = $1
            `, [
                email,
                level
            ]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return !!pgres.rows.length;
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
            pgres = await this.pool.query(`
                UPDATE users
                    SET
                        flags = $2,
                        access = $3
                    WHERE
                        id = $1
                    RETURNING *
            `, [
                uid,
                user.flags,
                user.access
            ]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        try {
            // Force relogin on account changes
            await this.pool.query(`
                DELETE FROM
                    session
                WHERE
                    (sess->'auth'->>'uid')::BIGINT = $1
            `, [
                uid
            ]);
        } catch (err) {
            throw new Err(500, err, 'Failed to reset sessions');
        }

        const row = pgres.rows[0];

        return {
            id: parseInt(row.id),
            level:  row.level,
            username: row.username,
            email: row.email,
            access: row.access,
            flags: row.flags
        };
    }

    /**
     * Return a list of users
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Username or Email fragment to filter by
     * @param {String} [query.level=] - Donor level to filter by
     * @param {String} [query.access=] - User Access to filter by
     */
    async list(query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';

        const where = [];

        query.page = query.page * query.limit;

        if (query.access) where.push(`access = '${query.access}'`);
        if (query.level) where.push(`level = '${query.level}'`);

        let pgres;
        try {
            pgres = await this.pool.query(`
                SELECT
                    count(*) OVER() AS count,
                    id,
                    username,
                    level,
                    access,
                    email,
                    flags
                FROM
                    users
                WHERE
                    (username ~ $3 OR email ~ $3)
                    ${where.length ? 'AND ' + where.join(' AND ') : ''}
                ORDER BY
                    created DESC
                LIMIT
                    $1
                OFFSET
                    $2
            `, [
                query.limit,
                query.page,
                query.filter
            ]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            users: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    level: row.level,
                    username: row.username,
                    email: row.email,
                    access: row.access,
                    flags: row.flags
                };
            })
        };
    }

    async user(uid) {
        let pgres;
        try {
            pgres = await this.pool.query(`
                SELECT
                    id,
                    level,
                    username,
                    access,
                    email,
                    flags
                FROM
                    users
                WHERE
                    id = $1
            `, [
                uid
            ]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (pgres.rows.length === 0) {
            throw new Error(404, null, 'Failed to retrieve user');
        }

        return {
            uid: parseInt(pgres.rows[0].id),
            level: pgres.rows[0].level,
            username: pgres.rows[0].username,
            email: pgres.rows[0].email,
            access: pgres.rows[0].access,
            flags: pgres.rows[0].flags
        };
    }

    async login(user) {
        if (!user.username) throw new Err(400, null, 'username required');
        if (!user.password) throw new Err(400, null, 'password required');

        if (user.username === 'internal') throw new Err(400, null, '"internal" is not a valid username');

        let pgres;
        try {
            pgres = await this.pool.query(`
                SELECT
                    id,
                    username,
                    level,
                    access,
                    email,
                    password,
                    flags,
                    validated
                FROM
                    users
                WHERE
                    username = $1 OR
                    email = $1;
            `, [
                user.username
            ]);
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

        return {
            uid: parseInt(pgres.rows[0].id),
            level: pgres.rows[0].level,
            username: pgres.rows[0].username,
            access: pgres.rows[0].access,
            email: pgres.rows[0].email,
            flags: pgres.rows[0].flags
        };
    }

    async register(user) {
        if (!user.username) throw new Err(400, null, 'username required');
        if (!user.password) throw new Err(400, null, 'password required');
        if (!user.email) throw new Err(400, null, 'email required');

        if (user.username === 'internal') throw new Err(400, null, '"internal" is not a valid username');

        try {
            const uhash = await bcrypt.hash(user.password, 10);

            const pgres = await this.pool.query(`
                INSERT INTO users (
                    username,
                    email,
                    password,
                    access,
                    flags
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    'user',
                    '{}'::JSONB
                ) RETURNING *
            `, [
                user.username,
                user.email,
                uhash
            ]);

            const row = pgres.rows[0];

            return {
                id: parseInt(row.id),
                username: row.username,
                email: row.email,
                access: row.access,
                flags: row.flags
            };
        } catch (err) {
            if (err.code && err.code === '23505') {
                throw new Err(400, null, 'User already exists');
            }

            throw new Err(500, err, 'Failed to register user');
        }
    }
}

module.exports = User;
