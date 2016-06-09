define([
	'observable',
	'socket'
], function(Observable, io) {
	'use strict';
	var api;
	var connection;
	var observable = new Observable();
	var socket = io();

	function initEvents() {
		socket.on('connection', function(socket){
			//TODO
		});
		socket.on('dots', function listenMessage(message){
			if (message.extend) {
				if (message.type) {
					observable.propertyChange(message.type, message.extend);
				}
			}
		});
	}

	initEvents();

	function sendData(data) {
		return new Promise(function(resolve) {
			socket.emit('dots', JSON.stringify(data), function (response) {
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
		},
		getId: function() {
			return socket.id;
		}
	};
	return api;
});