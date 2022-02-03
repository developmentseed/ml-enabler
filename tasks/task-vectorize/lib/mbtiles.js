'use strict';
import MBT from '@mapbox/mbtiles';

class MBTiles {
    constructor(mbtiles) {
        this.mbtiles = mbtiles;
    }

    static create(input) {
        return new Promise((resolve, reject) => {
            new MBT(input, (err, mbtiles) => {
                if (err) return reject(err);
                return resolve(new MBTiles(mbtiles));
            });
        });
    }

    getInfo() {
        return new Promise((resolve, reject) => {
            this.mbtiles.getInfo((err, info) => {
                if (err) return reject(err);
                return resolve(info);
            });
        });
    }

    putInfo(data) {
        return new Promise((resolve, reject) => {
            this.mbtiles.putInfo(data, (err) => {
                if (err) return reject(err);
                return resolve(true);
            });
        });
    }

    getTile(z, x, y) {
        return new Promise((resolve, reject) => {
            this.mbtiles.getTile(z, x, y, (err, tile) => {
                if (err) return reject(err);
                return resolve(tile);
            });
        });
    }

    putTile(z, x, y, buffer) {
        return new Promise((resolve, reject) => {
            this.mbtiles.putTile(z, x, y, buffer, (err) => {
                if (err) return reject(err);
                return resolve(true);
            });
        });
    }

    startWriting() {
        return new Promise((resolve, reject) => {
            this.mbtiles.startWriting((err) => {
                if (err) return reject(err);
                return resolve(true);
            });
        });
    }

    stopWriting() {
        return new Promise((resolve, reject) => {
            this.mbtiles.stopWriting((err) => {
                if (err) return reject(err);
                return resolve(true);
            });
        });
    }
}

export default MBTiles;
