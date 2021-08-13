'use strict';

const Err = require('../error');
const { sql } = require('slonik');
const Generic = require('../generic');

/**
 * @class
 */
class ProjectIteration extends Generic {
    static _table = 'iterations';

    constructor() {
        super();

        this._table = ProjectIteration._table;

        this.id = false;
        this.pid = false;
        this.created = false;
        this.updated = false;
        this.tile_zoom = false;
        this.docker_link = false;
        this.log_link = false;
        this.model_link = false;
        this.checkpoint_link = false;
        this.tfrecord_link = false;
        this.save_link = false;
        this.inf_list = false;
        this.inf_type = false;
        this.inf_binary = false;
        this.inf_supertile = false;
        this.version = false;
        this.hint = false;
        this.imagery_id = false;

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../../schema/req.body.PatchIteration.json').properties);
    }

    /**
     * Return a list of iterations for a given project
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} pid Project ID to access
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Name to filter by
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, pid, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';

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
                    id,
                    hint,
                    created,
                    updated,
                    version,
                    docker_link,
                    log_link,
                    model_link,
                    checkpoint_link,
                    tfrecord_link,
                    save_link
                FROM
                    iterations
                WHERE
                    pid = ${pid}
                    AND version ~ ${query.filter}
                ORDER BY
                    ${sql.identifier(['iterations', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Integration Error');
        }

        return ProjectIteration.deserialize(pgres.rows);
    }

    serialize() {
        return {
            id: this.id,
            created: this.created,
            updated: this.updated,
            pid: this.pid,
            tile_zoom: this.tile_zoom,
            docker_link: this.docker_link,
            log_link: this.log_link,
            model_link: this.model_link,
            checkpoint_link: this.checkpoint_link,
            tfrecord_link: this.tfrecord_link,
            save_link: this.save_link,
            inf_list: this.inf_list,
            inf_type: this.inf_type,
            inf_binary: this.inf_binary,
            inf_supertile: this.inf_supertile,
            version: this.version,
            hint: this.hint,
            imagery_id: this.imagery_id
        };
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE iterations
                    SET
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Integration');
        }
    }

    static async generate(pool, iter) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO iterations (
                    pid,
                    hint,
                    imagery_id,
                    inf_binary,
                    inf_list,
                    inf_supertile,
                    inf_type,
                    tile_zoom,
                    version
                ) VALUES (
                    ${iter.pid},
                    ${iter.hint},
                    ${iter.imagery_id},
                    ${iter.inf_binary},
                    ${iter.inf_list},
                    ${iter.inf_supertile},
                    ${iter.inf_type},
                    ${iter.tile_zoom},
                    ${iter.version}
                ) RETURNING *
            `);

            return ProjectIteration.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Integration');
        }
    }
}

module.exports = ProjectIteration;
