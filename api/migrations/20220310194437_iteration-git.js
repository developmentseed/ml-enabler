export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            ADD COLUMN gitsha TEXT;
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            DROP COLUMN gitsha;
    `);
}
