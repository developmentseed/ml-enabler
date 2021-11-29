const { Err } = require('@openaddresses/batch-schema');
const { sql } = require('slonik');
const Generic = require('../generic');

/**
 * @class
 */
class ProjectIteration extends Generic {
    static _table = 'iterations';
    static _patch = require('../../schema/req.body.PatchIteration.json');
    static _res = require('../../schema/res.Iteration.json');

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

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE iterations
                    SET
                        model_link          = ${this.model_link},
                        checkpoint_link     = ${this.checkpoint_link},
                        tfrecord_link       = ${this.tfrecord_link},
                        save_link           = ${this.save_link},
                        docker_link         = ${this.docker_link},
                        updated             = NOW()
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
