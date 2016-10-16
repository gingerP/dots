var server;
var Observable = require('./Observable').class;
var WebSocketServer = require('socket.io');
var logger = req('src/js/logger').create('WSServer');
var listenerToOut = 'out::';
var listenerToIn = 'in::';

function WSServer(http) {
    this.http = http;
    this.connections = {};
    this.connectionWrappers = {};
    this.listeners = {};
}

WSServer.prototype = Object.create(Observable.prototype);
WSServer.prototype.constructor = WSServer;

WSServer.prototype.init = function (removeTimeout) {
    this.removeTimeout = removeTimeout;
    this.ws = WebSocketServer(this.http);
    this._initEvents();
    logger.info('WebSocket server started!');
    return this;
};

WSServer.prototype._initEvents = function () {
    var inst = this;
    this.ws.on('reconnection', function () {

    });
    this.ws.on('connection', function (connection) {
        logger.info('Peer "%s" connected.', connection.client.conn.remoteAddress);
        var wrapper = inst.addConnection('client', connection, connection.id);
        connection.on('dots', function (message, callback) {
            try {
                var data = inst.extractMessage(message);
                inst.propertyChange(listenerToIn + data.type, {client: wrapper, data: data, callback: callback});
            } catch (e) {
                logger.error('While parsing input message: ' + e.message);
            }
        });
        connection.on('disconnect', function (reasonCode, description) {
            inst.removeConnection(this, {code: reasonCode, description: description});
            logger.info('Peer "%s" disconnected.', connection.client.conn.remoteAddress);
        });
    });
};

WSServer.prototype.evaluateTopic = function (original) {
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
};

WSServer.prototype.addConnection = function (topic, connection, id) {
    var connectionWraper;
    if (!topic) {
        logger.warn('Invalid topic for websocket connection: "&s"', topic);
        return;
    }
    this.connections[topic] = this.connections[topic] || [];
    this.connectionWrappers[topic] = this.connectionWrappers[topic] || [];
    if (this.connections[topic].indexOf(connection) < 0) {
        connectionWraper = this.createConnectionWrapper(connection, topic, id);
        this.connections[topic].push(connection);
        this.connectionWrappers[topic].push(connectionWraper);
        this.addListener(topic + listenerToOut, connectionWraper);
        this.propertyChange('new_connection', connectionWraper);
    }
    return connectionWraper;
};

WSServer.prototype.getListeners = function (topic) {
    return this.listeners[topic];
};

WSServer.prototype.removeConnection = function (connection, reason) {
    var index, wrapperIndex;
    for (var topic in this.connections) {
        index = this.connections[topic].indexOf(connection);
        wrapperIndex = this.connectionWrappers[topic].indexOf(connection);
        if (index > -1) {
            this.connections[topic].splice(index, 1);
            this.propertyChange('remove_connection', [connection, reason]);
        }
        for (wrapperIndex = 0; wrapperIndex < this.connectionWrappers[topic].length; wrapperIndex++) {
            if (this.connectionWrappers[topic][wrapperIndex].equalConnection(connection)) {
                this.connectionWrappers[topic].splice(wrapperIndex, 1);
                break;
            }
        }
    }
    return this;
};

WSServer.prototype.createConnectionWrapper = function (connection, topic, id) {
    var inst = this;
    var api;
    var topicEvent = 'on' + topic.slice(0, 1).toUpperCase() + topic.slice(1) + 'Change';
    api = {
        getTopic: function () {
            return topic;
        },
        getId: function () {
            return id;
        },
        sendData: function (data, type) {
            return new Promise(function (resolve) {
                connection.emit(type, data, function (data) {
                    resolve(data);
                });
                /*connection.send(type, data, function(data) {
                 resolve(data);
                 });*/
            });
        },
        equalConnection: function (con) {
            return connection == con;
        },
        registerListeners: function (key) {
            connection.on(key, function (message, callback) {
                try {
                    var data = inst.extractMessage(message);
                    inst.propertyChange(key, {client: api, data: data, callback: callback});
                } catch (e) {
                    logger.error(e.stack);
                }
            });
        }
    };
    api[topicEvent] = function (data) {
        connection.sendUTF(inst.prepareMessage(data, 'global_' + topic));
    };
    return api;
};

WSServer.prototype.getWrappers = function (ids) {
    if (!ids) {
        return [];
    }
    var result = [];
    var wrapperIndex;
    var idList = Array.isArray(ids) ? ids : [ids];

    for (var topic in this.connections) {
        for (wrapperIndex = 0; wrapperIndex < this.connectionWrappers[topic].length; wrapperIndex++) {
            if (ids.indexOf(this.connectionWrappers[topic][wrapperIndex].getId()) > -1) {
                result.push(this.connectionWrappers[topic][wrapperIndex]);
            }
        }
    }
    return result;
};

WSServer.prototype.prepareMessage = function (data, type, extend) {
    return JSON.stringify({
        type: type,
        data: data,
        extend: extend || {}
    });
};

WSServer.prototype.extractMessage = function (data) {
    return JSON.parse(data);
};

WSServer.prototype.addListenerIn = function (property, listener) {
    this.addListener(listenerToIn + property, listener);
};

WSServer.prototype.addListenerOut = function (property, listener) {
    this.addListener(listenerToOut + property, listener);
};

module.exports = {
    class: WSServer,
    instance: function (http) {
        if (!server) {
            server = new WSServer(http).init();
        }
        return server;
    }
};