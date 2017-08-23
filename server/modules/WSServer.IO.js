'use strict';
var server;
var Observable = require('./Observable').class;
var WebSocketServer = require('socket.io');
var logger = require('server/logging/logger').create('WSServer');
var DEFAULT_TOPIC = 'connection';
var connectedNum = 0;
var disconnectedNum = 0;
var _ = require('lodash');
var Promise = require('bluebird');
const Errors = require('../errors');

class WSServer extends Observable {
    constructor(http) {
        super();
        this.http = http;
        this.connections = {};
        this.listeners = {};
        this.handlers = {};
        this.events = {
            NEW_CONNECTION: 'new_connection',
            REMOVE_CONNECTION: 'remove_connection'
        };
    }

    init(removeTimeout) {
        this.removeTimeout = removeTimeout;
        this.ws = WebSocketServer(this.http.server);
        this._initEvents();
        this.initAuth();
        logger.info('WebSocket server started!');
        return this;
    }

    initAuth() {
        var config = this.http.sessionConfig;
        var cookieParser = require('cookie-parser')(config.secret);

        this.ws.use(function (socket, next) {
            cookieParser(socket.handshake, {}, function (err) {
                if (err) {
                    logger.error('error in parsing cookie');
                    return next(err);
                }
                if (!socket.handshake.signedCookies) {
                    logger.error('no secureCookies|signedCookies found');
                    return next(new Error('no secureCookies found'));
                }
                config.store.get(socket.handshake.signedCookies[config.name], function (err, session) {
                    socket.session = session;
                    if (!err && !session) {
                        err = new Error('session not found');
                    }
                    if (err) {
                        logger.error(`failed connection to socket.io: ${err.message}`);
                    } else {
                        logger.debug('successful connection to socket.io');
                    }
                    next(err);
                });
            });
        });
    }

    storeSession(connection) {
        return new Promise((resolve) => {
            var config = this.http.sessionConfig;
            var sessionId = connection.handshake.signedCookies[config.name];
            config.store.set(sessionId, connection.session, function (error, message) {
                logger.debug(`Session stored! ${JSON.stringify(connection.session)}`);
                resolve();
            });
        });
    };

    _initEvents() {
        var inst = this;
        this.ws.on('reconnection', function () {

        });
        this.ws.on('connection', function (connection) {
            connectedNum++;
            logger.debug('Peer "%s" connected. %s', connection.client.conn.remoteAddress, connectedNum);
            let wrapper = inst.addConnection(connection, connection.id);
            connection.on('disconnect', function (reasonCode, description) {
                disconnectedNum++;
                inst.removeConnection(this.id, {code: reasonCode});
                logger.debug(`Peer "${connection.client.conn.remoteAddress}" disconnected. ${disconnectedNum}`);
            });
        });
    }

    evaluateTopic(original) {
        var result;
        var keys;
        var resultKeys = [];
        var index = 0;
        var key;
        if (original) {
            keys = original.split('/');
            while (index < keys.length) {
                key = keys[index].trim();
                if (key.length) {
                    resultKeys.push(key);
                }
                index++;
            }
        }
        if (resultKeys.length) {
            result = resultKeys.join('|');
        }
        return result;
    }

    addConnection(connection, id) {
        var connectionWrapper = this.createConnectionWrapper(connection, id);

        this.connections[id] = {
            wrapper: connectionWrapper
        };
        this.addListener(DEFAULT_TOPIC, connectionWrapper);
        this.propertyChange(this.events.NEW_CONNECTION, connectionWrapper);
        return connectionWrapper;
    }

    getListeners(topic) {
        return this.listeners[topic];
    }

    removeConnection(id, reason) {
        var connectionObj = this.connections[id];

        delete this.connections[id];
        this.runHandler(this.events.REMOVE_CONNECTION, {client: connectionObj.wrapper, data: reason});
        this.propertyChange(
            this.events.REMOVE_CONNECTION,
            {client: connectionObj.wrapper, data: reason}
        );

        return this;
    }

    createConnectionWrapper(connection, id) {
        var inst = this;
        var api;

        function getId() {
            return id;
        }

        function sendData(data, type) {
            return new Promise(function (resolve) {
                connection.emit(type, data, function (messageData) {
                    resolve(messageData);
                });
            });
        }

        function equalConnection(con) {
            return connection === con;
        }

        function registerListeners(key) {
            connection.on(key, async function (message, callback) {
                function cb(data) {
                    if (data instanceof Error) {
                        callback({error: data, data: null});
                    } else {
                        callback({error: null, data: data});
                    }
                }
                try {
                    const data = inst.extractMessage(message);
                    await inst.propertyChange(key, {client: api, data: data, callback: cb});
                    await inst.runHandler(key, {client: api, data: data, callback: cb});
                } catch (error) {
                    if (!(error instanceof Errors.GenericError)) {
                        error = new Errors.InternalError(error.stack);
                    }
                    logger.error(`Api request "${key}" finished with error.`);
                    logger.error(error.stack);
                    cb(error);
                }
            });
        }

        function getConnection() {
            return connection;
        }

        function getSession() {
            return connection.session;
        }

        function saveSession() {
            return inst.storeSession(connection);
        }

        function updateSession(data) {
            var session = getSession();

            if (!session) {
                logger.warn('Session did not found!');
                return api;
            }
            _.extend(session, data || {});
            inst.storeSession(connection);

            return api;
        }

        api = {
            getId: getId,
            sendData: sendData,
            saveSession: saveSession,
            getSession: getSession,
            updateSession: updateSession,
            getConnection: getConnection,
            equalConnection: equalConnection,
            registerListeners: registerListeners
        };
        return api;
    }

    setHandler(endPointName, ...handlers) {
        this.handlers[endPointName] = handlers;
        return this;
    }

    async runHandler(endPointName, message) {
        let callbackExecuted = false;
        async function _callback(responseData) {
            callbackExecuted = true;
            await message.callback(responseData);
        }
        const handlers = this.handlers[endPointName];
        if (!handlers || !handlers.length) {
            throw new Errors.RouteNotFoundError(`Route "${endPointName}" not found.`);
        }
        let index = 0;
        while(index < handlers.length && !callbackExecuted) {
            await handlers[index](message, endPointName);
            index++;
        }
    }

    forEach(callback) {
        if (typeof callback === 'function') {
            for (let key in this.connections) {//eslint-disable-line
                callback(this.connections[key].wrapper);
            }
        }
        return false;
    }

    prepareMessage(data, type, extend) {
        return JSON.stringify({
            type: type,
            data: data,
            extend: extend || {}
        });
    }

    extractMessage(data) {
        return JSON.parse(data);
    }
}
module.exports = {
    class: WSServer,
    instance: function (http) {
        if (!server) {
            server = new WSServer(http).init();
        }
        return server;
    }
};