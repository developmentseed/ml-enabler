'use strict';
const SM = require('@mapbox/sphericalmercator');
const sm = new SM({
    size: 256,
    antimeridian: true
});

/**
 * Computes the smallest BBOX given a stream of tiles
 *
 * @class
 * @param {object}  opts        Options Object
 * @param {boolean} opts.zoom   Enforce a single zoom level
 *
 */
class BBox {
    constructor(opts = {}) {

        this.zoom = opts.zoom || null;
        this.bbox = [null, null, null, null];
        this.tiles = 0;

        this.minzoom = null;
        this.maxzoom = null;
    }

    /**
     * Add a tile to the bbox, adjusting the bbox as necessaryt
     *
     * @param {number}  z   Z Tile Coordinate
     * @param {number}  x   X Tile Coordinate
     * @param {number}  y   Y Tile Coordinate
     */
    tile(z, x, y) {
        if (isNaN(parseInt(z))) throw new Error('z param must be integer');
        if (isNaN(parseInt(x))) throw new Error('x param must be integer');
        if (isNaN(parseInt(y))) throw new Error('y param must be integer');
        if (this.zoom && z !== this.zoom) throw new Error(`Zoom is not the enforced z${this.zoom}`);

        if (z < this.minzoom) this.minzoom = z;
        if (z > this.maxzoom) this.maxzoom = z;

        this.tiles++;
    }
}

module.exports = BBox;
