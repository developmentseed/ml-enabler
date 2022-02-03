'use strict';
import SM from '@mapbox/sphericalmercator';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import tb from '@mapbox/tilebelt';

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
        this.bbox = null; // [w, s, e, n]
        this.tiles = 0;

        this.stack = {};
        this.minzoom = null;
        this.maxzoom = null;
    }

    /**
     * Add a tile to the bbox, adjusting the bbox as necessaryt
     *
     * @param {number}  z   Z Tile Coordinate
     * @param {number}  x   X Tile Coordinate
     * @param {number}  y   Y Tile Coordinate
     *
     * @returns {Number[]}  Current BBox
     */
    tile(z, x, y) {
        if (isNaN(parseInt(z))) throw new Error('z param must be integer');
        if (isNaN(parseInt(x))) throw new Error('x param must be integer');
        if (isNaN(parseInt(y))) throw new Error('y param must be integer');
        if (this.zoom && z !== this.zoom) throw new Error(`Zoom is not the enforced z${this.zoom}`);

        if (this.minzoom === null || z < this.minzoom) this.minzoom = z;
        if (this.maxzoom === null || z > this.maxzoom) this.maxzoom = z;

        this.tiles++;

        if (!this.stack[z]) {
            this.stack[z] = {
                minx: x,
                miny: y,
                maxx: x,
                maxy: y
            }
        }

        if (x < this.stack[z].minx) this.stack[z].minx = x;
        if (x > this.stack[z].maxx) this.stack[z].maxx = x;
        if (y < this.stack[z].miny) this.stack[z].miny = y;
        if (y > this.stack[z].maxy) this.stack[z].maxy = y;

        if (this.bbox === null) {
            this.bbox = sm.bbox(x, y, z);
            return this.bbox;
        }

        const n = sm.bbox(x, y, z);

        if (n[0] < this.bbox[0]) this.bbox[0] = n[0];
        if (n[2] > this.bbox[2]) this.bbox[2] = n[2];

        if (n[1] < this.bbox[1]) this.bbox[1] = n[1];
        if (n[3] > this.bbox[3]) this.bbox[3] = n[3];

        return this.bbox;
    }

    /**
     * Return a fully quantified stack of zoom xyz ranges
     * Generates stack from highest zoom => 0
     *
     * @returns {Object}
     */
    gen_stack() {
        if (!this.minzoom) throw new Error('Cannot populate stack until minzoom is established');

        const stack = JSON.parse(JSON.stringify(this.stack));

        for (let z = this.minzoom; z > 0; z--) {
            if (stack[z - 1]) continue; // Only start populating where the data cuts out

            const min = tb.getParent([stack[z].minx, stack[z].miny, z]);
            const max = tb.getParent([stack[z].maxx, stack[z].maxy, z]);

            stack[z - 1] = {
                minx: min[0],
                miny: min[1],
                maxx: max[0],
                maxy: max[1]
            };
        }

        return stack;
    }

    /**
     * Calculate centre coordinates for the bbox
     *
     * @returns {Number[]}
     */
    centre() {
        if (this.bbox === null) throw new Error('Tiles have not been added to bbox, bbox is null');

        return centroid(bboxPolygon(this.bbox)).geometry.coordinates;
    }
}

export default BBox;
