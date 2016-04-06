define([
], function(socket) {
//	var sc = socket(window.location.origin + '/dots');
//	http://127.0.0.1:8180
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	if (!window.WebSocket) {
		console.error('Sorry, but your browser doesn\'t support WebSockets.');
		return;
	}
	var connection = new WebSocket('ws://127.0.0.1:8180', 'echo-protocol');

	connection.onopen = function () {
		console.info('connection.onopen');
	};

	connection.onerror = function (error) {
		console.info('connection.onerror');
	};

	connection.onmessage = function (message) {
		console.info('connection.onmessage');
	};
});