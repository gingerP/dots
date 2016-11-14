var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/js/game',
    output: {
        filename: 'common.bundle.js'
    },
    resolve: {
        alias: {
            angular: 'node_modules/angular/angular',
            storage: 'ext/basil.min',
            q: 'node_modules/q/q',
            lodash: 'node_modules/lodash/lodash',
            i18n: 'module.i18n',
            d3: 'ext/d3.min',
            jquery: 'ext/jquery-2.2.1.min',
            observable: 'module.observable',
            socket: 'ext/socket.io-1.4.5',
            'engine.io': 'ext/engine.io',
            'module.transport': 'common/module.transport',
            'module.graph': 'module.graph',
            'module.observable': 'module.observable',
            'module.backend.service': 'common/module.backend.service'
        },
        root: [
            path.resolve(__dirname),
            path.resolve(__dirname, 'src/js/v0.2/'),
            path.resolve(__dirname, 'src/js/')
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    ]
};