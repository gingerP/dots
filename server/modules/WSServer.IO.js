'use strict';
var server;
var Observable = require('./Observable').class;
var WebSocketServer = require('socket.io');
var logger = req('server/logging/logger').create('WSServer');
var DEFAULT_TOPIC = 'connection';
var connectedNum = 0;
var disconnectedNum = 0;

function WSServer(http) {
    this.http = http;
    this.connections = {};
    this.listeners = {};
    this.events = {
        NEW_CONNECTION: 'new_connection',
        REMOVE_CONNECTION: 'remove_connection'
    };
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
        connectedNum++;
        logger.info('Peer "%s" connected. %s', connection.client.conn.remoteAddress, connectedNum);
        let wrapper = inst.addConnection(connection, connection.id);
        connection.on('dots', function (message, callback) {
            try {
                let data = inst.extractMessage(message);
                inst.propertyChange(data.type, {client: wrapper, data: data, callback: callback});
            } catch (e) {
                logger.error('While parsing input message: ' + e.message);
            }
        });
        connection.on('disconnect', function (reasonCode, description) {
            disconnectedNum++;
            inst.removeConnection(this.id, {code: reasonCode, description: description});
            logger.info('Peer "%s" disconnected. %s', connection.client.conn.remoteAddress, disconnectedNum);
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

WSServer.prototype.addConnection = function (connection, id) {
    var connectionWrapper = this.createConnectionWrapper(connection, id);

    this.connections[id] = {
        wrapper: connectionWrapper
    };
    this.addListener(DEFAULT_TOPIC, connectionWrapper);
    this.propertyChange(this.events.NEW_CONNECTION, connectionWrapper);
    return connectionWrapper;
};

WSServer.prototype.getListeners = function (topic) {
    return this.listeners[topic];
};

WSServer.prototype.removeConnection = function (id, reason) {
    var connectionObj = this.connections[id];

    delete this.connections[id];
    this.propertyChange(
        this.events.REMOVE_CONNECTION,
        {client: connectionObj.wrapper, data: reason}
    );

    return this;
};

WSServer.prototype.createConnectionWrapper = function (connection, id) {
    var inst = this;
    var api;
    var extend;

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

    function setExtendData(data) {
        extend = data;
        return api;
    }

    function getExtendData() {
        return extend;
    }

    function equalConnection(con) {
        return connection === con;
    }

    function registerListeners(key) {
        connection.on(key, function (message, callback) {
            var data;
            try {
                data = inst.extractMessage(message);
                inst.propertyChange(key, {client: api, data: data, callback: callback});
            } catch (e) {
                logger.error(e.stack);
            }
        });
    }

    api = {
        getId: getId,
        sendData: sendData,
        setExtendData: setExtendData,
        getExtendData: getExtendData,
        getConnection: function() {return connection},
        equalConnection: equalConnection,
        registerListeners: registerListeners
    };
    return api;
};

WSServer.prototype.forEach = function (callback) {
    if (typeof callback === 'function') {
        for (let key in this.connections) {//eslint-disable-line
            callback(this.connections[key].wrapper);
        }
    }
    return false;
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

module.exports = {
    class: WSServer,
    instance: function (http) {
        if (!server) {
            server = new WSServer(http).init();
        }
        return server;
    }
};