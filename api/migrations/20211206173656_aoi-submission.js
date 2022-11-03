export function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE aoi_submission (
            id          BIGSERIAL,
            aoi_id      BIGINT REFERENCES aois(id),
            created     TIMESTAMP NOT NULL DEFAULT NOW(),
            iter_id     BIGINT NOT NULL REFERENCES iterations(id)
        );
    `);
}

export function down(knex) {
    return knex.schema.raw(`
        DROP TABLE aoi_submission;
    `);
}
