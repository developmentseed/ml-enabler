const Meta = require('./meta');

const Defaults = {
    // Disallow new user registration
    'user::registration': false,

    // Only allow new user registration for the given domains (ie: `@example.com`)
    'user::domains': []

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
                return Defaults[key]
            } else {
                throw err;
            }
        }
    }
}

module.exports = Settings;
