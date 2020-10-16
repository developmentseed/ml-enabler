const Assembly = require('@mapbox/assembly');

module.exports = {
    publicPath: './',
    chainWebpack: () => {
        Assembly.buildUserAssets('public/')
    }
}
