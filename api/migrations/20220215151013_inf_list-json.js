exports.up = function(knex) {
    return knex.schema.raw(`
        CREATE TABLE tmp AS
            SELECT
                id,
                JSON_AGG(jsonb) AS list
            FROM (
                SELECT
                    id,
                    ('{ "name": ' || json_array_elements(ARRAY_TO_JSON(STRING_TO_ARRAY(inf_list, ','))) || ' }')::JSONB
                FROM
                    iterations
            ) AS a
            GROUP BY
                id;

        ALTER TABLE iterations
            ALTER COLUMN
                inf_list TYPE JSONB
            USING
                '[]'::JSONB;

        UPDATE iterations
            SET
                inf_list = list
            FROM
                tmp
            WHERE
                iterations.id = tmp.id;

        DROP TABLE tmp;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(``);
}
