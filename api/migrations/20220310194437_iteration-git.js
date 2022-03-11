exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            ADD COLUMN gitsha TEXT;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            DROP COLUMN gitsha;
    `);
}
