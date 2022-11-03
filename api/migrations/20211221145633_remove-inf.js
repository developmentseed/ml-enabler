export function up(knex) {
    return knex.schema.raw(`
        DROP TABLE iteration_tiles;
    `);
}

export function down(knex) {
    return knex.schema.raw(``);
}
