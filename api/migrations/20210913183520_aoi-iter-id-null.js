export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE aois
            ALTER COLUMN iter_id DROP NOT NULL;
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE aois
            ALTER COLUMN iter_id SET NOT NULL;
    `);
}
