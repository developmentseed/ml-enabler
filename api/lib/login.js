import Err from '@openaddresses/batch-error';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './types/user.js';
import UserReset from './types/user_reset.js';

/**
 * @class
 */
export default class Login {
    /**
     * Verify a password reset token
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {String}  token           Password reset token
     */
    static async verify(pool, token) {
        if (!token) throw new Err(400, null, 'token required');

        const reset = await UserReset.from(pool, token, 'verify');
        await UserReset.delete_all(pool, reset.uid);

        await User.commit(pool, reset.uid, {
            validated: true
        });
    }

    static async reset(pool, body) {
        if (!body.token) throw new Err(400, null, 'token required');
        if (!body.password) throw new Err(400, null, 'password required');

        const reset = await UserReset.from(pool, body.token, 'reset');
        await UserReset.delete_all(pool, reset.uid);

        const user = await User.from(pool, reset.uid);
        await user.set_password(pool, body.password);
    }

    /**
     * Given a username or email, generate a password reset or validation email
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {string}  username        username or email to reset
     * @param {string}  [action=reset]  'reset' or 'verify'
     */
    static async forgot(pool, username, action = 'reset') {
        if (!username || !username.length) throw new Err(400, null, 'username must not be empty');

        const u = await User.from_username(pool, username);
        await UserReset.delete_all(pool, u.id);

        const reset = await UserReset.generate(pool, u.id, action);

        return {
            uid: u.id,
            username: u.username,
            email: u.email,
            token: reset.token
        };
    }

    static async attempt(pool, body, secret) {
        if (!body.username) throw new Err(400, null, 'username required');
        if (!body.password) throw new Err(400, null, 'password required');

        const user = await User.from_username(pool, body.username);

        if (!await bcrypt.compare(body.password, user.password)) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!user.validated) {
            throw new Err(403, null, 'User has not confirmed email');
        }

        if (user.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        const token = jwt.sign({
            u: user.id
        }, secret);

        return {
            id: user.id,
            username: user.username,
            access: user.access,
            email: user.email,
            token
        };
    }
}
