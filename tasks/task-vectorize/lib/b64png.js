const fs = require('fs');
const path = require('path');
const RL = require('readline');
const MBTiles = require('./mbtiles');

/**
 * @class
 */
class B64PNG {
    static async convert(input, opts) {
        const mbtiles = await MBTiles.create(path.resolve(opts.tmp, `fabric.mbtiles`));
        await mbtiles.startWriting();

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

            await mbtiles.putTile(line.z, line.x, line.y, png);
        }

        await mbtiles.putInfo({
            name: 'Fabric',
            description: 'Autogenerated',
            format: 'png',
            version: 2,
            minzoom: 18,
            maxzoom: 18,
            center: "0,0,1"
        });

        await mbtiles.stopWriting();
    }
}

module.exports = B64PNG;
