exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE aois
            ALTER COLUMN iter_id DROP NOT NULL;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE aois
            ALTER COLUMN iter_id SET NOT NULL;
    `);
}
