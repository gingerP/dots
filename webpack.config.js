var path = require('path');
var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    context: __dirname + '/src/js',
    entry: {
        app: './game'
    },
    output: {
        filename: 'common.bundle.js',
        path: __dirname + '/build',
        publicPath: '/static/'
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
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: 'style!css!less',
                query: {

                }
            }
        ]
    },
    plugins: [
        new ngAnnotatePlugin({
            add: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                output: {
                    comments: false
                },
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })],
    devtool: 'source-map'
};
