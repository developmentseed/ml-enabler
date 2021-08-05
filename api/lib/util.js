'use strict';

const Err = require('./error');

class Param {
    static async int(req, name) {
        req.params[name] = Number(req.params[name]);
        if (isNaN(req.params[name])) {
            throw new Err(400, null, `${name} param must be an integer`);
        }
    }
}

module.exports = {
    Param
};

