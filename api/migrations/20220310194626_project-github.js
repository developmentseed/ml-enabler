export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects
            ADD COLUMN github_repo TEXT;
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE projects    
            DROP COLUMN github_repo;
    `);
}
