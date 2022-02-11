'use strict';
const { Err } = require('@openaddresses/batch-schema');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);
const jwt = require('jsonwebtoken');
const { sql } = require('slonik');
const User = require('./user');

/**
 * @class
 */
class Login {
    /**
     * Verify a password reset token
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {String}  token           Password reset token
     */
    static async verify(pool, token) {
        if (!token) throw new Err(400, null, 'token required');

        let pgres;
        try {
            pgres = await pool.query(sql`
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

    static async reset(user) {
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
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {string}  username        username or email to reset
     * @param {string}  [action=reset]  'reset' or 'verify'
     */
    static async forgot(pool, username, action='reset') {
        if (!username || !username.length) throw new Err(400, null, 'user must not be empty');

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    id,
                    username,
                    email
                FROM
                    users
                WHERE
                    username = ${username}
                    OR email = ${username}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (pgres.rows.length !== 1) return;
        const u = pgres.rows[0];
        u.id = parseInt(u.id);

        try {
            await pool.query(sql`
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

            await pool.query(sql`
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

    static async attempt(pool, body, secret) {
        if (!body.username) throw new Err(400, null, 'username required');
        if (!body.password) throw new Err(400, null, 'password required');

        const user = await User.from_username(pool, body);

        if (!await bcrypt.compare(body.password, user.password)) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!user.validated) {
            throw new Err(403, null, 'User has not confirmed email');
        }

        if (user.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        const token = jwt.sign({
            u: user.id
        }, secret);

        return {
            uid: user.id,
            username: user.username,
            access: user.access,
            email: user.email,
            token
        };
    }
}

module.exports = Login;
