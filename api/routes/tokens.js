

const { Err } = require('@openaddresses/batch-schema');
const UserToken = new require('../lib/token');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/token List Tokens
     * @apiVersion 1.0.0
     * @apiName ListTokens
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     List all tokens associated with the requester's account
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListTokens.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListTokens.json} apiSuccess
     */
    await schema.get('/token', {
        query: 'req.query.ListTokens.json',
        res: 'res.ListTokens.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.query.uid = req.auth.uid;
            return res.json(await UserToken.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/token Create Token
     * @apiVersion 1.0.0
     * @apiName CreateToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new API token for programatic access
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateToken.json} apiParam
     * @apiSchema {jsonschema=../schema/res.CreateToken.json} apiSuccess
     */
    await schema.post('/token', {
        body: 'req.body.CreateToken.json',
        res: 'res.CreateToken.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.body.uid = req.auth.uid;
            return res.json((await UserToken.generate(config.pool, req.body)).serialize(true));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/token/:token_id Get Token
     * @apiVersion 1.0.0
     * @apiName GetToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Get information about a single token
     *
     * @apiSchema {jsonschema=../schema/res.Token.json} apiSuccess
     */
    await schema.get('/token/:token_id', {
        ':token_id': 'integer',
        res: 'res.Token.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            let token = await UserToken.from(config.pool, req.params.token_id);
            if (token.uid !== req.auth.uid) throw new Err(401, null, 'Cannot get a token you did not create');

            token = token.serialize();
            delete token.token;
            return res.json(token);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/token/:token_id Delete Token
     * @apiVersion 1.0.0
     * @apiName DeleteToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a user's API Token
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/token/:token_id', {
        ':token_id': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const token = await UserToken.from(config.pool, req.params.token_id);
            if (token.uid !== req.auth.uid) throw new Err(401, null, 'Cannot delete a token you did not create');

            await token.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Token Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
