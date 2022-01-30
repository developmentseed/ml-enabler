'use strict';
const fs = require('fs');
const path = require('path');
const RL = require('readline');
const MBTiles = require('./mbtiles');
const BBox = require('./bbox');
const PNG = require('fast-png');
const colour = require('randomcolor');
const { Image } = require('image-js');

/**
 * @class
 *
 * @param {Array} Palette
 */
class B64PNG {
    constructor(palette) {
        if (palette) {
            this.palette = palette;
        } else {
            this.palette = new Array(256).fill(
                colour({ format: 'rgb' })
                    .replace(/(rgb\(|\)|\s)/g, '')
                    .split(',')
                    .map(e => parseInt(e))
            );
        }
    }

    async convert(input, opts) {
        const bbox = new BBox();

        const mbtiles = await MBTiles.create(path.resolve(opts.tmp, 'fabric.mbtiles'));
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

            bbox.tile(line.z, line.x, line.y);


            let png = PNG.decode(new Buffer.from(line.image, 'base64'));
            png.palette = this.palette;

            png = exportPNG(loadPNGFromPalette(png));

            await mbtiles.putTile(line.z, line.x, line.y, Buffer.from(png));
        }

        await mbtiles.putInfo({
            name: 'Fabric',
            description: 'Autogenerated',
            format: 'png',
            version: 2,
            minzoom: bbox.minzoom,
            maxzoom: bbox.maxzoom,
            bounds: bbox.bbox.join(','),
            center: bbox.center().concat([bbox.maxzoom]).join(',')
        });

        await mbtiles.stopWriting();
    }
}

// Internal Export FN
// https://github.com/image-js/image-js/blob/675bafe1ec5f78d2d5d36df67e14e254d27a1f2d/src/image/core/export.js#L25-L41
// Can't find a way to export to Buffer
function exportPNG(image, options = {}) {
    const data = {
        width: image.width,
        height: image.height,
        channels: image.channels,
        depth: image.bitDepth,
        data: image.data,
    };

    if (data.depth === 1 || data.depth === 32) {
        data.depth = 8;
        data.channels = 4;
        data.data = image.getRGBAData();
    }

    return PNG.encode(data, options);
}

function loadPNGFromPalette(png) {
    const pixels = png.width * png.height;
    const channels = png.palette[0].length;
    const data = new Uint8Array(pixels * channels);
    const pixelsPerByte = 8 / png.depth;
    const factor = png.depth < 8 ? pixelsPerByte : 1;
    const mask = parseInt('1'.repeat(png.depth), 2);
    const hasAlpha = channels === 4;
    let dataIndex = 0;

    for (let i = 0; i < pixels; i++) {
        const index = Math.floor(i / factor);
        let value = png.data[index];
        if (png.depth < 8) {
            value =
                (value >>> (png.depth * (pixelsPerByte - 1 - (i % pixelsPerByte)))) &
                mask;
        }
        const paletteValue = png.palette[value];
        data[dataIndex++] = paletteValue[0];
        data[dataIndex++] = paletteValue[1];
        data[dataIndex++] = paletteValue[2];

        if (hasAlpha) {
            data[dataIndex++] = paletteValue[3];
        }
    }

    return new Image(png.width, png.height, data, {
        components: 3,
        alpha: hasAlpha,
        bitDepth: 8,
    });
}


module.exports = B64PNG;
