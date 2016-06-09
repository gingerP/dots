var server;
var Observable = require('./Observable').class;
var WebSocketServer = require('socket.io');
var logger = _req('src/js/logger').create('WSServer');
var listenerToOut = 'out::';
var listenerToIn = 'in::';

function WSServer(http) {
	this.http = http;
	this.connections = {};
	this.listeners = {};
}

WSServer.prototype = Object.create(Observable.prototype);
WSServer.prototype.constructor = WSServer;

WSServer.prototype.init = function(removeTimeout) {
	this.removeTimeout = removeTimeout;
	this.ws = WebSocketServer(this.http);
	this._initEvents();
	logger.info('WebSocket server started!');
	return this;
};

WSServer.prototype._initEvents = function() {
	var inst = this;
	this.ws.on('connection', function (connection) {
		logger.info('Peer "%s" connected.', connection.client.conn.remoteAddress);
		var wrapper = inst.addConnection('client', connection, connection.id);
		connection.on('dots', function (message) {
			try {
				var data = inst.extractMessage(message);
			} catch (e) {
				logger.error('While parsing input message: ' + e.message);
			}
			inst.propertyChange(listenerToIn + data.type, { client: wrapper, data: data });
		});
		connection.on('disconnect', function (reasonCode, description) {
			inst.removeConnection(this, {code: reasonCode, description: description});
			logger.info('Peer "%s" disconnected.', connection.client.conn.remoteAddress);
		});
	});
};

WSServer.prototype.evaluateTopic = function(original) {
	var result;
	var keys;
	var resultKeys = [];
	var index = 0;
	var key;
	if (original) {
		keys = original.split('/');
		while(index < keys.length) {
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

WSServer.prototype.addConnection = function(topic, connection, id) {
	var connectionWraper;
	if (!topic) {
		logger.warn('Invalid topic for websocket connection: "&s"', topic);
		return;
	}
	this.connections[topic] = this.connections[topic] || [];
	if (this.connections[topic].indexOf(connection) < 0) {
		this.connections[topic].push(connection);
		connectionWraper = this.createConnectionWrapper(connection, topic, id);
		this.addListener(topic + listenerToOut, connectionWraper);
		this.propertyChange('new_connection', connectionWraper);
	}
	return connectionWraper;
};

WSServer.prototype.getListeners = function(topic) {
	return this.listeners[topic];
};

WSServer.prototype.removeConnection = function(connection, reason) {
	var index;
	for(var topic in this.connections) {
		index = this.connections[topic].indexOf(connection);
		if (index > -1) {
			this.connections[topic].splice(index, 1);
			this.propertyChange('remove_connection', [connection, reason]);
		}
	}
	return this;
};

WSServer.prototype.createConnectionWrapper = function(connection, topic, id) {
	var inst = this;
	var api;
	var topicEvent = 'on' + topic.slice(0, 1).toUpperCase() + topic.slice(1) + 'Change';
	api = {
		getTopic: function() {
			return topic;
		},
		getId: function() {
			return id;
		},
		sendData: function(data, type) {
			return new Promise(function(resolve) {
				connection.emit(type, data, function(data) {
					resolve(data);
				});
			});
		},
		equalConnection: function(con) {
			return connection == con;
		}
	};
	api[topicEvent] = function(data) {
		connection.sendUTF(inst.prepareMessage(data, 'global_' + topic));
	};
	return api;
};

WSServer.prototype.prepareMessage = function(data, type, extend) {
	return JSON.stringify({
		type: type,
		data: data,
		extend: extend || {}
	});
};

WSServer.prototype.extractMessage = function(data) {
	return JSON.parse(data);
};

WSServer.prototype.addListenerIn = function(property, listener) {
	this.addListener(listenerToIn + property, listener);
};

WSServer.prototype.addListenerOut = function(property, listener) {
	this.addListener(listenerToOut + property, listener);
};

module.exports = {
	class: WSServer,
	instance: function(http) {
		if (!server) {
			server = new WSServer(http).init();
		}
		return server;
	}
};