const MBT = require('@mapbox/mbtiles');

class MBTiles {
    constructor(mbtiles) {
        this.mbtiles = mbtiles;
    }

    static create(input) {
        return new Promise((resolve, reject) => {
            new MBTiles(`${input}?mode=rwc`, (err, mbtiles) => {
                if (err) return reject(err);
                return resolve(new MBTiles(mbtiles));
            });
        });
    }

    putInfo(data) {
        return new Promise((resolve, reject) => {
            this.mbtiles.putInfo(data, (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    }

    putTile(z, x, y, buffer) {
        return new Promise((resolve, reject) => {
            this.mbtiles.putTile(z, x, y, buffer, (err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    }

    startWriting() {
        return new Promise((resolve, reject) => {
            this.mbtiles.startWriting((err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    }

    stopWriting() {
        return new Promise((resolve, reject) => {
            this.mbtiles.stopWriting((err) => {
                if (err) return reject(err);
                return resolve();
            });
        });
    }
}

module.exports = MBTiles;
