import Err from '@openaddresses/batch-error';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';
import S3 from '../s3.js';

/**
 * @class
 */
export default class Submission extends Generic {
    static _table = 'aoi_submission';

    /**
     * Return a list of aoi submissions for the given iteration
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Number} iteration Iteration to list submissions for
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     */
    static async list(pool, iteration, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

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
                    aoi_submission.id,
                    aoi_submission.iter_id,
                    aoi_submission.aoi_id,
                    aoi_submission.created,
                    iterations.pid
                FROM
                    aoi_submission
                        LEFT JOIN iterations
                            ON aoi_submission.iter_id = iterations.id
                WHERE
                    iter_id = ${iteration}
                ORDER BY
                    ${sql.identifier(['aoi_submission', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Tasks Error');
        }

        return await this.list_s3(this.deserialize(pgres.rows, 'submissions'));
    }

    static async from(pool, id, pid) {
        const sub = await super.from(pool, id);

        sub.storage = await S3.exists(`project/${pid}/iteration/${sub.iter_id}/submission-${sub.id}.geojson`);
        sub.tiles = await S3.exists(`project/${pid}/iteration/${sub.iter_id}/submission-${sub.id}.tilebase`);

        return sub;
    }

    static async list_s3(list) {
        if (!list.submissions.length) return list;

        const s3m = {};
        const s3t = {};

        (await S3.list(`project/${list.submissions[0].pid}/iteration/${list.submissions[0].iter_id}/submission-`)).forEach((l) => {
            const geojson_match = l.Key.match(/submission-(\d+).geojson/);
            if (geojson_match) s3m[geojson_match[1]] = l.Key;

            const tiles_match = l.Key.match(/submission-(\d+).tilebase/);
            if (tiles_match) s3t[tiles_match[1]] = l.Key;
        });

        for (const sub of list.submissions) {
            sub.storage = !!s3m[sub.id];
            sub.tiles = !!s3t[sub.id];
        }

        return list;
    }
}
