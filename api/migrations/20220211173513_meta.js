exports.up = function(knex) {
    return knex.schema.raw(`
        CREATE TABLE meta (
            key TEXT NOT NULL PRIMARY KEY,
            value JSONB NOT NULL
        )
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        DROP TABLE meta;
    `);
}
