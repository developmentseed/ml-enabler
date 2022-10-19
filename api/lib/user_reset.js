import Err from '@openaddresses/batch-error';
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);
const { sql } = require('slonik');
const Generic = require('@openaddresses/batch-generic');

/**
 * @class
 */
class UserReset extends Generic {
    static _table = 'users_reset';
    static _patch = null;
    static _res = require('../schema/res.UserReset.json');


    /**
     * Return a UserReset object given a token
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {String}  token           Password reset token
     * @param {String}  [action=verify] Token Action
     */
    static async from(pool, token, action = 'verify') {
        if (!token) throw new Err(400, null, 'token required');

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    users_reset
                WHERE
                    expires > NOW()
                    AND token = ${token}
                    AND action = ${action}
            `);
        } catch (err) {
            throw new Err(500, err, 'User Reset Error');
        }

        if (pgres.rows.length !== 1) {
            throw new Err(401, null, 'Invalid or Expired Reset Token');
        }

        return this.deserialize(pgres.rows[0]);
    }

    static async delete_all(pool, uid) {
        try {
            await pool.query(sql`
                DELETE FROM users_reset
                    WHERE uid = ${uid}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to delete Reset Token');
        }
    }

    static async generate(pool, uid, action) {
        try {
            const buffer = await randomBytes(40);

            const pgres = await pool.query(sql`
                INSERT INTO
                    users_reset (uid, expires, token, action)
                VALUES (
                    ${uid},
                    NOW() + interval '1 hour',
                    ${buffer.toString('hex')},
                    ${action}
                )
                RETURNING *
            `);

            return this.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }
    }
}

module.exports = UserReset;
