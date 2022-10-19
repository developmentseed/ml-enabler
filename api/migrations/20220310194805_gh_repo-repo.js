export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects
            RENAME github_repo TO repo;
    `);
}

export function down(knex) {
    return knex.schema.raw(``);
}
