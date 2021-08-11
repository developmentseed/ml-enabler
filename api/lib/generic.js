'use strict';

const Err = require('./error');

/**
 * @class
 */
class Generic {
    constructor() {
        if (!this._table) this._table = false;
    }

    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }

    async deserialize(dbrow) {
        const gen = new Generic();

        for (const key of Object.keys(dbrow)) {
            gen[key] = dbrow[key];
        }

        return gen;
    }

    async from(pool, id) {
        if (!this._table) throw new Err(500, null, 'Internal: Table not defined');

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    ${sql.identifier([this.table])}
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

    async delete(pool, id) {
        if (!this._table) throw new Err(500, null, 'Internal: Table not defined');

        try {
            await pool.query(sql`
                DELETE FROM ${sql.identifier([this.table])}
                    WHERE
                        id = ${this.id}
            `);

            return true;
        } catch (err) {
            throw new Err(500, err, `Failed to delete from ${this.table}`);
        }
    }
}

module.exports = Generic;
