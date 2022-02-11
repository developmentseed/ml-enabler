const Meta = require('./meta');

const Defaults = {
    // Disallow new user registration
    'user::registration': {
        type: 'boolean',
        default: false
    }

    // Only allow new user registration for the given domains (ie: `@example.com`)
    'user::domains': {
        type: 'array',
        items: { type: 'string' },
        default: []
    }

};

/**
 * @class
 */
class Settings {
    static async from(pool, key) {
        try {
            return await Meta.from(pool, key);
        } catch (err) {
            if (err.status === 404 && Defaults[key] !== undefined) {
                return Defaults[key].default
            } else {
                throw err;
            }
        }
    }
}

module.exports = Settings;
