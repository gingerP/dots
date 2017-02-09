'use strict';
var fs = require('fs');
var _ = require('lodash');
var utils = require('server/utils/utils');
var logger = require('server/logging/logger').create('WebServer');
var session = require('express-session');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');
var appConfiguration = require('application-configuration/application');
var passport = require('passport');

function WebServer(props) {
    this.app = express();
    this.passport = passport;
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
    this.store = new RedisStore(_.extend({
        client: redis.createClient()
    }, appConfiguration.redis));
    this.store.on('error', logger.error.bind(logger));

    if (this.props.network.ssl.active) {
        this._initHTTPS();
    } else {
        this._initHTTP();
    }
    return this;
};

WebServer.prototype._initHTTP = function () {
    this.transport = require('http');
    this.port = this.props.network.http || 8080;
    this.server = this.transport.createServer(this.app);
    this.app.set('port', this.port);

    this.sessionConfig = {
        key: 'connect.sid',
        secret: 'keyboard cat',
        store: this.store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            httpOnly: false,
            maxAge: 2419200000
        }
    };
    this.app.use(session(this.sessionConfig));
    this.server.listen(this.props.network.http, this.props.network.host, () => {
        logger.info('Node server started on http://%s:%d', this.props.network.host, this.props.network.http);
    });
    logger.info('HTTP server successfully created.');
};

WebServer.prototype._initHTTPS = function () {
    this.transport = require('https');
    this.port = this.props.network.https || 8443;
    this.app.set('port', this.port);
    this.server = this.transport.createServer(this._getCertFiles(), this.app);
    this.sessionConfig = {
        name: 'connect.sid',
        secret: 'keyboard cat',
        store: this.store,
        resave: false,
        saveUninitialized: true,
        rolling: true,
        cookie: {
            secure: true,
            maxAge: 2419200000
        }
    };
    this.app.use(cookieParser());
    this.app.use(bodyParser());
    this.app.use(session(this.sessionConfig));
    this.app.use(this.passport.initialize());
    this.app.use(this.passport.session());

    this.server.listen(this.props.network.https, this.props.network.host, () => {
        console.info('Node server started on https://%s:%d', this.props.network.host, this.props.network.https);
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
