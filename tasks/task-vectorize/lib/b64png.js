const fs = require('fs');
const path = require('path');
const RL = require('readline');
const MBTiles = require('./mbtiles');

/**
 * @class
 */
class B64PNG {
    static async convert(input, opts) {
        const rl = RL.createInterface({
            input: fs.createReadStream(input)
        });

        const mbtiles = await MBTiles.create(path.resolve(opts.tmp, `fabric.mbtiles`));

        for await (let line of rl) {
            try {
                line = JSON.parse(line);
            } catch (err) {
                console.error(err);
                continue;
            }

            const png = new Buffer.from(line.image, 'base64');

        }
    }
}

module.exports = B64PNG;
