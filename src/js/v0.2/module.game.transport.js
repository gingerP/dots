define([
	'observable'
], function(Observable) {
	'use strict';
	var api;
	var connection;
	var observable = new Observable();
	var TOPIC = '/dots';

	function init() {
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		if (!window.WebSocket) {
			console.error('Sorry, but your browser doesn\'t support WebSockets.');
			return;
		}
		var wsProtocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
		try {
			connection = new WebSocket(wsProtocol + window.location.host + '/' + TOPIC, 'echo-protocol');
		} catch (e) {
			console.error(e.message);
		}
	}

	function initEvents() {
		connection.onopen = function () {

		};

		connection.onerror = function (error) {

		};

		connection.onmessage = function (message) {
			var data;
			if (message.data) {
				data = JSON.parse(message.data);
				if (data.data.type) {
					observable.propertyChange(data.data.type, data.data);
				}
			}
		};
	}

	init();
	if (!connection) {
		return;
	}


	initEvents();

	function sendData(data) {
		connection.send(JSON.stringify(data));
	}

	api = {
		sendData: sendData,
		addListener: function(property, listener) {
			observable.addListener(property, listener);
			return api;
		},
		listen: {
			add_dot: 'add_dot',
			add_client: 'add_client'
		}
	};
	return api;
});