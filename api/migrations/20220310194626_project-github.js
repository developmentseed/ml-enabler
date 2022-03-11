exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects
            ADD COLUMN github_repo TEXT;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects    
            DROP COLUMN github_repo;
    `);
}
