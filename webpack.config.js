var path = require('path');
var webpack = require('webpack');
var NgAnnotatePlugin = require('ng-annotate-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname + '/src/js',
    entry: {
        app: './game'
    },
    devServer: {
        // This is required for older versions of webpack-dev-server
        // if you use absolute 'to' paths. The path should be an
        // absolute path to your build destination.
        outputPath: path.join(__dirname, 'build')
    },
    output: {
        filename: 'common.bundle.js',
        path: __dirname + '/build/js',
        publicPath: '/static/js/'
    },
    resolve: {
        extensions: ['', '.js'],
        alias: {
            storage: 'ext/basil.min',
            q: 'node_modules/q/q',
            lodash: 'node_modules/lodash/lodash',
            i18n: 'module.i18n',
            d3: 'ext/d3.min',
            jquery: 'ext/jquery-2.2.1.min',
            observable: 'module.observable',
            socket: 'ext/socket.io-1.4.5',
            'engine.io': 'ext/engine.io'
        },
        root: [
            path.resolve(__dirname),
            path.resolve(__dirname, 'src/js/v0.2/'),
            path.resolve(__dirname, 'src/js/')
        ]
    },
    plugins: [
        new NgAnnotatePlugin({
            add: true
        }),
        new CopyWebpackPlugin([
            {from: '../images', to: '../images'}
        ]),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    ],
    devtool: 'source-map'
};
