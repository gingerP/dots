'use strict';
var fs = require('fs');
var _ = require('lodash');
var utils = req('server/utils/utils');
var logger = req('server/logging/logger').create('WebServer');
var session = require('express-session');

function WebServer(props) {
    this.app = require('express')();
    this.props = _.merge({
        network: {
            host: '0.0.0.0',
            http: 8180,
            https: 8443,
            ssl: {
                active: false
            }
        }
    }, props);
}

WebServer.prototype.init = function (props) {
    this.props = utils.merge(this.props, props);
    return this;
};

WebServer.prototype.start = function () {
    if (this.props.network.ssl.active) {
        this._initHTTPS();
    } else {
        this._initHTTP();
    }
    return this;
};

WebServer.prototype._initHTTP = function () {
    var inst = this;
    inst.transport = require('http');
    inst.port = inst.props.network.http || 8080;
    inst.server = inst.transport.createServer(inst.app);
    inst.app.set('port', this.port);
    inst.app.use(session({
        secret: 'secret',
        key: 'express.sid',
        resave: true,
        saveUninitialized: true
    }));

    inst.server.listen(inst.props.network.http, inst.props.network.host, function () {
        logger.info('Node server started on http://%s:%d', inst.props.network.host, inst.props.network.http);
    });
    logger.info('HTTP server successfully created.');
};

WebServer.prototype._initHTTPS = function () {
    var inst = this;
    inst.transport = require('https');
    inst.port = inst.props.network.https || 8443;
    inst.app.set('port', inst.port);
    inst.server = inst.transport.createServer(inst._getCertFiles(), inst.app);
    inst.server.listen(inst.props.network.https, inst.props.network.host, function () {
        logger.info('Node server started on https://%s:%d', inst.props.network.host, inst.props.network.https);
    });
    logger.info('HTTPS server successfully created.');
};

WebServer.prototype._initEvents = function () {
    var inst = this;
    this.server.on('error', onError);
    this.server.on('listening', onListening);

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error('Port requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error('Post is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = inst.server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        logger.debug('Listening on ' + bind);
    }
};

WebServer.prototype._getCertFiles = function () {
    return {
        key: fs.readFileSync(this.props.network.ssl.path + '/server.key'),
        cert: fs.readFileSync(this.props.network.ssl.path + '/server.crt')
    };
};

module.exports = {
    class: WebServer
};
