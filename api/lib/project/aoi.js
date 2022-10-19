const { Err } = require('@openaddresses/batch-schema');
const Generic = require('@openaddresses/batch-generic');
const { sql } = require('slonik');
const bboxPolygon = require('@turf/bbox-polygon').default;

/**
 * @class
 */
class ProjectAOI extends Generic {
    static _table = 'aois';
    static _patch = require('../../schema/req.body.PatchAOI.json');
    static _res = require('../../schema/res.AOI.json');

    /**
     * Return a list of aois for a given project
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
                    aois.id,
                    aois.iter_id,
                    aois.name,
                    aois.created,
                    aois.updated,
                    aois.bounds
                FROM
                    aois
                WHERE
                    aois.name ~ ${query.filter}
                    AND pid = ${pid}
                ORDER BY
                    ${sql.identifier(['aois', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal AOI Error');
        }

        return ProjectAOI.deserialize(pgres.rows);
    }

    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE aois
                    SET
                        name        = ${this.name},
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save AOI');
        }
    }

    static async generate(pool, aoi) {
        try {
            aoi.bounds = bboxPolygon(aoi.bounds).geometry;

            const pgres = await pool.query(sql`
                INSERT INTO aois (
                    pid,
                    iter_id,
                    name,
                    bounds
                ) VALUES (
                    ${aoi.pid},
                    ${aoi.iter_id || null},
                    ${aoi.name},
                    ST_GeomFromGeoJSON(${JSON.stringify(aoi.bounds)})
                ) RETURNING *
            `);

            return ProjectAOI.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate AOI');
        }
    }
}

module.exports = ProjectAOI;
