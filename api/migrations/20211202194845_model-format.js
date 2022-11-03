export function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            ADD COLUMN model_type TEXT NOT NULL DEFAULT 'tensorflow';
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE iterations
            DROP COLUMN model_type;
    `);
}
