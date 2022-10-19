const { Err } = require('@openaddresses/batch-schema');

/**
 * @class
 */
class Auth {
    static async is_auth(req) {
        if (req.user === 'internal') return true;

        if (!req.user || !req.user.access || !req.user.id) {
            throw new Err(401, null, 'Authentication Required');
        }

        if (req.user.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    static async is_admin(req) {
        if (req.user === 'internal') return true;

        await this.is_auth(req);

        if (req.user.access !== 'admin') {
            throw new Err(401, null, 'Admin token required');
        }

        return true;
    }

}

module.exports = Auth;
