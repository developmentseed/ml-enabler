exports.up = function(knex) {
    return knex.schema.raw(`
        CREATE TABLE aoi_submission (
            id          BIGSERIAL,
            aoi_id      BIGINT REFERENCES aois(id),
            created     TIMESTAMP NOT NULL DEFAULT NOW(),
            iter_id     BIGINT NOT NULL REFERENCES iterations(id)
        );
    `);
}

exports.down = function(knex) {
    return knex.schema.raw(`
        DROP TABLE aoi_submission;
    `);
}
