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
