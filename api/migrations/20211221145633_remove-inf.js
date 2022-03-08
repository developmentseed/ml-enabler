exports.up = function(knex) {
    return knex.schema.raw(`
        DROP TABLE iteration_tiles;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(``);
}
