'use strict';

const Err = require('./error');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

class Token {
    constructor(pool) {
        this.pool = pool;
    }

    async delete(auth, token_id) {
        if (!auth.uid) {
            throw new Err(500, null, 'Server could not determine user id');
        }

        try {
            await this.pool.query(`
                DELETE FROM
                    users_tokens
                WHERE
                    uid = $1
                    AND id = $2
            `, [
                auth.uid,
                token_id
            ]);

            return {
                status: 200,
                message: 'Token Deleted'
            };

        } catch (err) {
            throw new Err(500, err, 'Failed to delete token');
        }
    }

    async validate(token) {
        if (token.split('.').length !== 2 || token.split('.')[0] !== 'oa' || token.length !== 67) {
            throw new Err(401, null, 'Invalid token');
        }

        let pgres;
        try {
            pgres = await this.pool.query(`
                SELECT
                    users.id AS uid,
                    users.level,
                    users.username,
                    users.access,
                    users.email,
                    users.flags
                FROM
                    users_tokens INNER JOIN users
                        ON users.id = users_tokens.uid
                WHERE
                    users_tokens.token = $1
            `, [
                token
            ]);
        } catch (err) {
            throw new Err(500, err, 'Failed to validate token');
        }

        if (!pgres.rows.length) {
            throw new Err(401, null, 'Invalid token');
        } else if (pgres.rows.length > 1) {
            throw new Err(401, null, 'Token collision');
        }

        return {
            uid: parseInt(pgres.rows[0].uid),
            level: pgres.rows[0].level,
            username: pgres.rows[0].username,
            access: pgres.rows[0].access,
            email: pgres.rows[0].email
        };
    }

    async list(auth) {
        if (!auth.uid) {
            throw new Err(500, null, 'Server could not determine user id');
        }

        try {
            const pgres = await this.pool.query(`
                SELECT
                    id,
                    created,
                    name
                FROM
                    users_tokens
                WHERE
                    uid = $1
            `, [
                auth.uid
            ]);

            return {
                total: pgres.rows.length,
                tokens: pgres.rows.map((token) => {
                    token.id = parseInt(token.id);

                    return token;
                })
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to list tokens');
        }
    }

    async generate(auth, name) {
        if (auth.type !== 'session') {
            throw new Err(400, null, 'Only a user session can create a token');
        } else if (!auth.uid) {
            throw new Err(500, null, 'Server could not determine user id');
        } else if (!name || !name.trim()) {
            throw new Err(400, null, 'Token name required');
        }

        try {
            const pgres = await this.pool.query(`
                INSERT INTO users_tokens (
                    token,
                    created,
                    uid,
                    name
                ) VALUES (
                    $1,
                    NOW(),
                    $2,
                    $3
                ) RETURNING *
            `, [
                'oa.' + (await randomBytes(32)).toString('hex'),
                auth.uid,
                name
            ]);

            return {
                id: parseInt(pgres.rows[0].id),
                name: pgres.rows[0].name,
                token: pgres.rows[0].token,
                created: pgres.rows[0].created
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to generate token');
        }
    }
}

module.exports = Token;
