exports.up = function(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects
            RENAME github_repo TO repo;
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(``);
}
