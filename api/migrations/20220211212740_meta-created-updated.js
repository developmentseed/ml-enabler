exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE meta
            ADD COLUMN created TIMESTAMP NOT NULL DEFAULT NOW();

        ALTER TABLE meta
            ADD COLUMN updated TIMESTAMP NOT NULL DEFAULT NOW();
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(``);
}
