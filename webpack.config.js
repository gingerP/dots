var path = require('path');
var webpack = require('webpack');
var NgAnnotatePlugin = require('ng-annotate-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname + '/client/js',
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
            'angular-animate': 'node_modules/angular-animate/angular-animate',
            storage: 'node_modules/basil.js/build/basil',
            q: 'node_modules/q/q',
            lodash: 'node_modules/lodash/lodash',
            d3: 'node_modules/d3/build/d3',
            jquery: 'node_modules/jquery/dist/jquery',
            socket: 'node_modules/socket.io-client/dist/socket.io'
        },
        root: [
            path.resolve(__dirname),
            path.resolve(__dirname, 'client/js/v0.2/'),
            path.resolve(__dirname, 'client/js/')
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
