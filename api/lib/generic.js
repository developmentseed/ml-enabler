'use strict';

const Err = require('./error');
const { sql } = require('slonik');

/**
 * @class
 */
class Generic {
    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }

    static async from(pool, id) {
        if (!this._table) throw new Err(500, null, 'Internal: Table not defined');

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    ${sql.identifier([this._table])}
                WHERE
                    id = ${id}
            `);
        } catch (err) {
            throw new Err(500, err, `Failed to load from ${this._table}`);
        }

        if (!pgres.rows.length) {
            throw new Err(404, null, `${this._table} not found`);
        }

        return this.deserialize(pgres.rows[0]);
    }

    deserialize(dbrow) {
        if (!this._schema) throw new Err(500, null, 'Internal: Schema not defined');

        console.error(this);
    }

    async delete(pool) {
        if (!this._table) throw new Err(500, null, 'Internal: Table not defined');

        try {
            await pool.query(sql`
                DELETE FROM ${sql.identifier([this._table])}
                    WHERE
                        id = ${this.id}
            `);

            return true;
        } catch (err) {
            throw new Err(500, err, `Failed to delete from ${this._table}`);
        }
    }
}

module.exports = Generic;
