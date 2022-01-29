const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const RL = require('readline');

/**
 * @class
 */
class B64PNG {
    static async convert(input, opts) {
        const rl = RL.createInterface({
            input: fs.createReadStream(input)
        });

        for await (let line of rl) {
            try {
                line = JSON.parse(line);
            } catch (err) {
                console.error(err);
                continue;
            }

            const png = new Buffer.from(line.image, 'base64');

            console.error(line);
            await fsp.writeFile(path.resolve(opts.tmp, `${line.z}-${line.x}-${line.y}.png`), png);
        }
    }
}

module.exports = B64PNG;
