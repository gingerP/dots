define([
	'observable',
	'socket'
], function(Observable, IO) {
	'use strict';
	var api;
	var connection;
	var observable = new Observable();
	var TOPIC = '/dots';
	var socket = IO(TOPIC);

	function initEvents() {
		socket.on('connection', function(socket){
			//TODO
		});
		socket.on('message', function(message){
			var data;
			if (message.data) {
				data = JSON.parse(message.data);
				if (data.data.type) {
					observable.propertyChange(data.data.type, data.data);
				}
			}
		});
	}

	initEvents();

	function sendData(data) {
		new Promise(function(resolve) {
			socket.emit('dots', JSON.stringify(data), function(response) {
				resolve(response);
			});
		});
	}

	api = {
		sendData: sendData,
		addListener: function(property, listener) {
			observable.addListener(property, listener);
			return api;
		},
		listen: {
			add_dot: 'add_dot',
			add_client: 'add_client',
			invite_player: 'invite_player'
		}
	};
	return api;
});