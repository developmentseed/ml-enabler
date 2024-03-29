import PG from 'pg';
const Pool = PG.Pool;

import config from '../knexfile.js';

export default async function drop() {
    const pool = new Pool({
        connectionString: config.connection
    });

    const pgres = await pool.query(`
        SELECT
            'drop table "' || tablename || '" cascade;' AS drop
        FROM
            pg_tables
        WHERE
            schemaname = 'public'
            AND tablename != 'spatial_ref_sys'
    `);

    for (const r of pgres.rows) {
        await pool.query(r.drop);
    }

    await pool.end();
}
