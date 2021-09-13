'use strict';

const Err = require('../lib/error');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/mapbox Mapbox Settings
     * @apiVersion 1.0.0
     * @apiName GetMapbox
     * @apiGroup Mapbox
     * @apiPermission user
     *
     * @apiDescription
     *     Return necessary information to show Mapbox maps
     *
     * @apiSchema {jsonschema=../schema/res.Mapbox.json} apiSuccess
     */
    await schema.get('/mapbox', {
        res: 'res.Mapbox.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            res.json({
                token: config.Mapbox
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
