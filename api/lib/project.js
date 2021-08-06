'use strict';

const Err = require('./error');
const { sql } = require('slonik');

/**
 * @class
 */
class Project {
    constructor() {
        this.id = false;
        this.created = false;
        this.source = '';
        this.project_url = '';
        this.archived = false;
        this.tags = {};
        this.access = false;
        this.notes = '';

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../schema/req.body.PatchProject.json').properties);
    }

    static deserialize(dbrow) {
        dbrow.id = parseInt(dbrow.id);

        const prj = new Project();

        for (const key of Object.keys(dbrow)) {
            prj[key] = dbrow[key];
        }

        return prj;
    }

    /**
     * Return a list of users
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
                    projects.name,
                    projects.source,
                    projects.archived,
                    projects.project_url,
                    projects.access
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

        return {
            total: pgres.rows.length ? parseInt(pgres.rows[0].count) : 0,
            projects: pgres.rows.map((row) => {
                return {
                    id: parseInt(row.id),
                    created: row.created,
                    name: row.name,
                    source: row.source,
                    archived: row.archived,
                    project_url: row.project_url,
                    access: row.access
                };
            })
        };
    }

    static serialize(project) {
        return {
            id: parseInt(project.id),
            created: project.created,
            source: project.source,
            project_url: project.project_url,
            archived: project.archived,
            tags: project.tags,
            access: project.access,
            notes: project.notes
        };
    }

    static async from(pool, id) {
        try {
            const pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    project
                WHERE
                    id = ${id}
            `);

            if (!pgres.rows.length) {
                throw new Err(404, null, 'Project not found');
            }
            return Project.serialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to load project');
        }
    }

    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }

    async commit(pool) {
        if (this.id === false) throw new Err(500, null, 'Project.id must be populated');

        try {
            await pool.query(sql`
                UPDATE project
                    SET
                        source      = ${this.source},
                        project_url = ${this.project_url},
                        archived    = ${this.archived},
                        tags        = ${JSON.stringify(this.tags)}::JSONB,
                        access      = ${this.access},
                        notes       = ${this.notes}
                    WHERE
                        id = ${this.id}
            `);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Project');
        }
    }

    async generate(pool, prj) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO project (
                    name,
                    source,
                    project_url,
                    tags,
                    access,
                    notes
                ) VALUES (
                    ${prj.name},
                    ${prj.source},
                    ${prj.project_url},
                    ${JSON.stringify(prj.tags)}::JSONB,
                    ${prj.access},
                    ${prj.notes}
                ) RETURNING *
            `);

            return Project.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Project');
        }
    }
}

module.exports = Project;
