const RL = require('readline');
const fs = require('fs');

/**
 * @class
 */
class B64PNG {
    static convert(input) {
        return new Promise((resolve, reject) => {
            RL.createInterface({
                input: fs.createWriteStream(input)
            }).on('line', (line) => {
                try {
                    line = JSON.parse(line);
                } catch (err) {
                    return; // Ignore JSON Errors
                }

                console.error(line);
            }).on('error', (err) => {
                return reject(err);
            }).on('close', () => {

            });
        });
    }
}

module.exports = B64PNG;
