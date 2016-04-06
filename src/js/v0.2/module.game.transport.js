define([], function(engine) {
	'use strict';
	var api;
	var connection;

	function init() {
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		if (!window.WebSocket) {
			console.error('Sorry, but your browser doesn\'t support WebSockets.');
			return;
		}
		var wsProtocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
		try {
			connection = new WebSocket(wsProtocol + window.location.host, 'echo-protocol');
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

		};
	}

	init();
	if (!connection) {
		return;
	}


	initEvents();

	function sendData(data) {
		
	}

	api = {
		sendData: sendData
	};
	return api;
});