export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE tasks
            ADD COLUMN log_link TEXT;

        ALTER TABLE iterations
            DROP COLUMN log_link;
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE tasks
            DROP COLUMN log_link;

        ALTER TABLE iterations
            ADD COLUMN log_link TEXT;
    `);
}
