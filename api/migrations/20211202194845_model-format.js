exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            ADD COLUMN model_type TEXT NOT NULL DEFAULT 'tensorflow';
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            DROP COLUMN model_type;
    `);
}
