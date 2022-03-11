'use strict';
const { Err } = require('@openaddresses/batch-schema');
const Generic = require('@openaddresses/batch-generic');
const { sql } = require('slonik');

/**
 * Class representing rows in projects table
 *
 * @class
 */
class Project extends Generic {
    static _table = 'projects';
    static _patch = require('../schema/req.body.PatchProject.json');
    static _res = require('../schema/res.Project.json');

    /**
     * Return a list of Projects
     *
     * @param {Pool} pool - Instantiated Postgres Pool
     *
     * @param {Object} query - Query Object
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page of users to return
     * @param {String} [query.filter=] - Name to filter by
     * @param {boolean} [query.archived=false] - Only show archived projects
     * @param {String} [query.sort=created] Field to sort by
     * @param {String} [query.order=asc] Sort Order (asc/desc)
     *
     * @returns {Object}
     */
    static async list(pool, query) {
        if (!query) query = {};
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;
        if (!query.filter) query.filter = '';
        if (!query.archived) query.archived = false;

        if (!query.sort) query.sort = 'created';
        if (!query.order || query.order === 'asc') {
            query.order = sql`asc`;
        } else {
            query.order = sql`desc`;
        }

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    projects.id,
                    projects.created,
                    projects.updated,
                    projects.name,
                    projects.source,
                    projects.archived,
                    projects.project_url,
                    projects.access,
                    projects.repo
                FROM
                    projects,
                    projects_access
                WHERE
                    projects.name ~ ${query.filter}
                    AND projects.archived = ${query.archived}
                    AND (
                        projects.access = 'public'
                        OR (
                            projects_access.uid = ${query.uid}
                            AND projects_access.pid = projects.id
                        )
                    )
                GROUP BY
                    projects.id
                ORDER BY
                    ${sql.identifier(['projects', query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        return this.deserialize(pgres.rows);
    }

    /**
     * Save a Project to the database
     *
     * @param {Pool}    pool    Instantiated Postgres Pool
     *
     * @returns {Project}
     */
    async commit(pool) {
        if (this.id === false) throw new Err(500, null, 'Project.id must be populated');

        try {
            await pool.query(sql`
                UPDATE projects
                    SET
                        source      = ${this.source},
                        project_url = ${this.project_url},
                        archived    = ${this.archived},
                        tags        = ${JSON.stringify(this.tags)}::JSONB,
                        access      = ${this.access},
                        notes       = ${this.notes},
                        repo        = ${this.repo || null},
                        updated     = NOW()
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Project');
        }
    }

    /**
     * Return an individual Project and if an optional uid parameter is provided,
     * only return the project if the user has access to it
     *
     * @param {Pool}    pool    Instantiated Postgres Pool
     * @param {Number}  id      Project ID
     * @param {Number}  [uid]   Optional User ID
     *
     * @returns {Project}
     */
    static async from(pool, id, uid) {
        if (!uid) return super.from(pool, id);

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    projects.id,
                    projects.created,
                    projects.updated,
                    projects.name,
                    projects.source,
                    projects.archived,
                    projects.project_url,
                    projects.access,
                    projects.tags,
                    projects.notes,
                    projects.repo
                FROM
                    projects,
                    projects_access
                WHERE
                    projects.id = ${id}
                    AND (
                        projects.access = 'public'
                        OR (
                            projects_access.uid = ${uid}
                            AND projects_access.pid = projects.id
                        )
                    )
                GROUP BY
                    projects.id
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal User Error');
        }

        if (!pgres.rows.length) throw new Err(404, null, 'Project does not exist or user does not have access');

        return this.deserialize(pgres.rows[0]);
    }

    /**
     * Generate a new Project and save it to the database
     *
     * @param {Pool}        pool                Instantiated Postgres Pool
     * @param {object}      prj                 Project Body
     * @param {string}      prj.name            Project Name
     * @param {string}      prj.source          Project Developer Org
     * @param {string}      prj.project_url     Project Reference URL
     * @param {object[]}    prj.tags            Project Billing Tags
     * @param {string}      prj.access          Project Access (public/private)
     * @param {string}      prj.notes           Project Notes
     * @param {string}      prj.repo            Project Git Repo
     */
    static async generate(pool, prj) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO projects (
                    name,
                    source,
                    project_url,
                    tags,
                    access,
                    notes,
                    repo
                ) VALUES (
                    ${prj.name},
                    ${prj.source},
                    ${prj.project_url},
                    ${JSON.stringify(prj.tags)}::JSONB,
                    ${prj.access},
                    ${prj.notes},
                    ${prj.repo || null}
                ) RETURNING *
            `);

            return this.deserialize(pgres.rows[0]);
        } catch (err) {
            if (err.originalError && err.originalError.code && err.originalError.code === '23505') {
                throw new Err(400, null, 'Project by that name already exists');
            }

            throw new Err(500, err, 'Failed to generate Project');
        }
    }
}

module.exports = Project;
