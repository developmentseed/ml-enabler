export function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE meta (
            key TEXT NOT NULL PRIMARY KEY,
            value JSONB NOT NULL
        )
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        DROP TABLE meta;
    `);
}
