var server;
var Observable = require('./Observable').class;
var WebSocketServer = require('websocket').server;
var logger = req('src/js/logger').create('WSServer');
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
	this.ws = new WebSocketServer({
		httpServer: this.http,
		// You should not use autoAcceptConnections for production
		// applications, as it defeats all standard cross-origin protection
		// facilities built into the protocol and the browser.  You should
		// *always* verify the connection's origin and decide whether or not
		// to accept it.
		autoAcceptConnections: false,
		rejectUnauthorized: false
	});
	this._initEvents();
	logger.info('WebSocket server started!');
	return this;
};

WSServer.prototype._initEvents = function() {
	var inst = this;
	function originIsAllowed(origin) {
		// put logic here to detect whether the specified origin is allowed.
		return true;
	}
	this.ws.on('request', function (request) {
		if (!originIsAllowed(request.origin)) {
			// Make sure we only accept requests from an allowed origin
			request.reject();
			logger.warn('Connection from origin ' + request.origin + ' rejected.');
			return;
		}
		try {
			var connection = request.accept('echo-protocol', request.origin);
		} catch (e) {
			logger.error(e.message);
			return;
		}
		var topic = inst.evaluateTopic(request.resource);
		logger.info('Peer "%s" connected.', connection.remoteAddress);
		var wrapper = inst.addConnection(topic, connection, request.key);
		connection.on('message', function (message) {
			var data;
			if (message.type == 'utf8') {
				data = inst.extractMessage(message.utf8Data);
				inst.propertyChange(listenerToIn + data.type, { client: wrapper, data: data });
			}
		});
		connection.on('close', function (reasonCode, description) {
			inst.removeConnection(this, {code: reasonCode, description: description});
			logger.info('Peer "%s" disconnected.', connection.remoteAddress);
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
			connection.sendUTF(inst.prepareMessage(data, type));
			return api;
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