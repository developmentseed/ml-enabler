'use strict';

const Err = require('./error');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);
const { sql } = require('slonik');

/**
 * @class Token
 */
class Token {
    /**
     * @constructor
     */
    constructor() {
        this.id = false;
        this.uid = false;
        this.created = false;
        this.name = false;
        this.token = false;

        this.attrs = Object.keys(require('../schema/req.body.PatchToken.json').properties);
    }

    /**
     * Deserialize from PG Row
     *
     * @param {Object} row - Postgres Row
     * @returns {Token}
     */
    static pg(row) {
        const token = new Token();
        token.id = parseInt(row.id);
        token.uid = parseInt(row.uid);
        Object.assign(token, row);
        return token;
    }

    /**
     * Serialize to json
     *
     * @param {boolean} secret - Show the token
     *
     * @returns {Object}
     */
    json(secret) {
        const token = {
            id: parseInt(this.id),
            created: parseInt(this.created),
            name: this.name
        };

        if (secret) token.token = this.token;

        return token;
    }

    /**
     * List & Filter Tokens
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} query - Query object
     * @param {Number} query.uid - Limit to a specific UID
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
                    id,
                    created,
                    name
                FROM
                    users_tokens
                WHERE
                    name ~ ${query.filter}
                    AND (${query.uid}::BIGINT IS NULL OR uid = ${query.uid})
                ORDER BY
                    id DESC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return {
                total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
                tokens: pgres.rows.map((token) => {
                    return {
                        id: parseInt(token.id),
                        created: parseInt(token.created),
                        name: token.name
                    };
                })
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to list tokens');
        }
    }

    /**
     * Get Token from ID
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Number} id - Token ID
     *
     * @returns {Token}
     */
    static async from(pool, id) {
        let pgres;

        try {
            pgres = await pool.query(sql`
                SELECT
                    id,
                    uid,
                    created,
                    name,
                    token
                FROM
                    users_tokens
                WHERE
                    id = ${id}
            `);
        } catch (err) {
            throw new Err(500, err , 'Failed to fetch token');
        }

        if (!pgres.rows.length) throw new Err(404, null, 'Token not found');

        return Token.pg(pgres.rows[0]);
    }

    /**
     * Patch supported params from a body
     *
     * @param {Object} patch
     */
    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }

    /**
     * Commit a token to the database
     *
     * @param {Pool} pool - Postgres Pool instance
     */
    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE users_tokens
                    SET
                        name = ${this.name}
                    WHERE
                        id = ${this.id}
            `);
        } catch (err) {
            throw new Err(500, err, 'failed to save token');
        }
    }

    /**
     * Delete a token
     *
     * @param {Pool} pool - Postgres Pool instance
     */
    async delete(pool) {
        try {
            await pool.query(sql`
                DELETE FROM
                    users_tokens
                WHERE
                    id = ${this.id}
            `);

            return {
                status: 200,
                message: 'Token Deleted'
            };
        } catch (err) {
            throw new Err(500, err, 'Failed to delete token');
        }
    }

    /**
     * Validate a token
     *
     * @param {String} token Token to validate
     */
    static async validate(pool, token) {
        if (token.split('.').length !== 2 || token.split('.')[0] !== 'mle' || token.length !== 68) {
            throw new Err(401, null, 'Invalid token');
        }

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    users.id AS uid,
                    users.username,
                    users.access,
                    users.email
                FROM
                    users_tokens INNER JOIN users
                        ON users.id = users_tokens.uid
                WHERE
                    users_tokens.token = ${token}
            `);
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
            username: pgres.rows[0].username,
            access: pgres.rows[0].access,
            email: pgres.rows[0].email
        };
    }

    /**
     * Create a new Token
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} params - Create Params
     * @param {Number} params.uid - User ID to assign token to
     * @param {String} params.name - Name of Token
     *
     * @returns {Token}
     */
    static async gen(pool, params = {}) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO users_tokens (
                    token,
                    created,
                    uid,
                    name
                ) VALUES (
                    ${'mle.' + (await randomBytes(32)).toString('hex')},
                    NOW(),
                    ${params.uid},
                    ${params.name}
                ) RETURNING *
            `);

            return Token.pg(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate token');
        }
    }
}

module.exports = Token;
