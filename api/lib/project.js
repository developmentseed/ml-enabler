'use strict';

const Err = require('./error');

/**
 * @class
 */
class Project {
    constructor() {
        this.id = false;
        this.created = false;
        this.source = '';
        this.project_url = ''
        this.archived = false;
        this.tags = {};
        this.access = false;
        this.notes = '';

        // Attributes which are allowed to be patched
        this.attrs = Object.keys(require('../schema/req.body.PatchProject.json').properties);
    }

    static deserialize(dbrow) {
        dbrow.id = BigInt(dbrow.id);

        const prj = new Project();

        for (const key of Object.keys(pgres.rows[0])) {
            prj[key] = pgres.rows[0][key];
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
            const pgres = await pool.query(`
                SELECT
                    *
                FROM
                    project
                WHERE
                    id = $1
            `, [id]);

            if (!pgres.rows.length) {
                return reject(new Err(404, null, 'Project not found'));
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
            await pool.query(`
                UPDATE project
                    SET
                        source      = COALESCE($2, source),
                        project_url = COALESCE($3, project_url)
                        archived    = COALESCE($4, archived),
                        tags        = COALESCE($5::JSONB, tags)
                        access      = COALESCE($6, access),
                        notes       = COALESCE($7, notes)
                    WHERE
                        id = $1
            `, [
                this.id,
                this.source,
                this.project_url,
                this.archived,
                JSON.stringify(this.tags),
                this.access = this.access,
                this.notes = this.notes
            ]);

            return this;
        } catch (err) {
            throw new Err(500, err, 'Failed to save Project');
        }
    }

    async generate(pool, prj) {
        try {
            const pgres = await pool.query(`
                INSERT INTO project (
                    name,
                    source,
                    project_url,
                    tags,
                    access,
                    notes
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                ) RETURNING *
            `, [
                prj.name,
                prj.source,
                prj.project_url,
                JSON.stringify(prj.tags),
                prj.access,
                prj.notes
            ]);

            return Project.deserialize(pgres.rows[0]);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate Project');
        }
    }
}

module.exports = Project;
