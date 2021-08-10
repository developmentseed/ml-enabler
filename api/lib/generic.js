'use strict';

/**
 * @class
 */
class Generic {
    patch(patch) {
        for (const attr of this.attrs) {
            if (patch[attr] !== undefined) {
                this[attr] = patch[attr];
            }
        }
    }
}

module.exports = Generic;
