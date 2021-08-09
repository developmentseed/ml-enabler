exports.up = function(knex) {
    return knex.schema.raw(`
        CREATE EXTENSION IF NOT EXISTS POSTGIS;
        CREATE EXTENSION IF NOT EXISTS PGCRYPTO;

        CREATE TABLE users (
            id                  BIGSERIAL PRIMARY KEY,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            email               TEXT UNIQUE NOT NULL,
            username            TEXT UNIQUE NOT NULL,
            password            TEXT NOT NULL,
            access              TEXT NOT NULL DEFAULT 'user',
            validated           BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE TABLE projects (
            id                  BIGSERIAL PRIMARY KEY,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            updated             TIMESTAMP NOT NULL DEFAULT NOW(),
            name                TEXT UNIQUE NOT NULL,
            source              TEXT NOT NULL DEFAULT '',
            project_url         TEXT NOT NULL DEFAULT '',
            archived            BOOLEAN NOT NULL DEFAULT FALSE,
            tags                JSONB NOT NULL DEFAULT '{}'::JSONB,
            access              TEXT NOT NULL DEFAULT 'private',
            notes               TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE projects_access (
            id                  BIGSERIAL PRIMARY KEY,
            pid                 BIGINT NOT NULL,
            uid                 BIGINT NOT NULL,
            access              TEXT NOT NULL,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),

            UNIQUE(pid, uid),

            CONSTRAINT fk_users
                FOREIGN KEY (uid)
                REFERENCES users(id),

            CONSTRAINT fk_proj
                FOREIGN KEY (pid)
                REFERENCES projects(id)
        );

        CREATE TABLE projects_invite (
            id                  BIGSERIAL PRIMARY KEY,
            pid                 BIGSERIAL NOT NULL,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            email               TEXT UNIQUE NOT NULL,
            token               TEXT NOT NULL,

            CONSTRAINT fk_projs
                FOREIGN KEY (pid)
                REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS users_reset (
            uid         BIGINT,
            expires     TIMESTAMP,
            token       TEXT,
            action      TEXT,

            CONSTRAINT fk_users
                FOREIGN KEY (uid)
                REFERENCES users(id)
        );

        CREATE TABLE users_tokens (
            id                  BIGSERIAL PRIMARY KEY,
            uid                 BIGINT NOT NULL,
            name                TEXT NOT NULL,
            token               TEXT NOT NULL,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),

            CONSTRAINT fk_users
                FOREIGN KEY (uid)
                REFERENCES users(id)
        );

        CREATE TABLE imagery (
            id                  BIGSERIAL PRIMARY KEY,
            pid                 BIGINT NOT NULL,
            name                TEXT NOT NULL,
            url                 TEXT NOT NULL,
            fmt                 TEXT NOT NULL,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            updated             TIMESTAMP DEFAULT NOW(),

            CONSTRAINT fk_projects
                FOREIGN KEY (pid)
                REFERENCES projects(id)
        );

        CREATE TABLE integration (
            id                  BIGSERIAL PRIMARY KEY,
            pid                 BIGINT NOT NULL,
            integration         TEXT NOT NULL,
            name                TEXT NOT NULL,
            url                 TEXT NOT NULL,
            auth                TEXT,

            CONSTRAINT fk_projects
                FOREIGN KEY (pid)
                REFERENCES projects(id)
        );

        CREATE TABLE iterations (
            id                  BIGSERIAL PRIMARY KEY,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            updated             TIMESTAMP NOT NULL DEFAULT NOW(),
            pid                 BIGINT NOT NULL,
            tile_zoom           INTEGER NOT NULL,
            docker_link         TEXT,
            log_link            TEXT,
            model_link          TEXT,
            checkpoint_link     TEXT,
            tfrecord_link       TEXT,
            save_link           TEXT,
            inf_list            TEXT,
            inf_type            TEXT,
            inf_binary          BOOLEAN,
            inf_supertile       BOOLEAN,
            version             TEXT,
            hint                TEXT,
            imagery_id          BIGINT,

            CONSTRAINT fk_projects
                FOREIGN KEY (pid)
                REFERENCES projects(id),

            CONSTRAINT fk_imagery
                FOREIGN KEY (imagery_id)
                REFERENCES imagery(id)
        );

        CREATE TABLE iteration_tiles (
            id                  BIGSERIAL PRIMARY KEY,
            iter_id             BIGINT NOT NULL,
            predictions         JSONB NOT NULL,
            geom                GEOMETRY(POLYGON, 4326) NOT NULL,
            validity            JSONB,

            CONSTRAINT fk_iterations
                FOREIGN KEY (iter_id)
                REFERENCES iterations(id)
        );

        CREATE TABLE model_aoi (
            id                  BIGSERIAL PRIMARY KEY,
            pid                 BIGINT NOT NULL,
            iter_id             BIGINT NOT NULL,
            bounds              GEOMETRY(POLYGON, 4326) NOT NULL,
            name                TEXT NOT NULL,

            CONSTRAINT fk_projects
                FOREIGN KEY (pid)
                REFERENCES projects(id),

            CONSTRAINT fk_iterations
                FOREIGN KEY (iter_id)
                REFERENCES iterations(id)
        );

        CREATE TABLE tasks (
            id                  BIGSERIAL PRIMARY KEY,
            iter_id             BIGINT NOT NULL,
            type                TEXT NOT NULL,
            created             TIMESTAMP NOT NULL DEFAULT NOW(),
            batch_id            TEXT,

            CONSTRAINT fk_iterations
                FOREIGN KEY (iter_id)
                REFERENCES iterations(id)
        );

    `);
}

exports.down = function(knex) {
    return knex.schema.raw(``);
}

