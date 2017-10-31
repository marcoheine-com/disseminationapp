var webpack = require('webpack');
var plugins = [];
var useMinifier = (process.argv.slice(1).indexOf('--minify') !== -1);

if (useMinifier) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    entry: ['./node_modules/es5-shim/es5-shim.js', './lib/index.js'],
    output: {
        path: './dist',
        filename: 'standalone' + (useMinifier ? '.min' : '') + '.js',
        library: 'MendeleySDK',
        libraryTarget: 'umd'
    },
    resolve: {
        modulesDirectories: [
            'node_modules',
            'lib',
            'test'
        ]
    },
    devtool: useMinifier ? 'source-map' : '',
    plugins: plugins
};
