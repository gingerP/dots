define([
    'observable',
    'socket',
    'q',
    'module.storage'
], function (Observable, io, q, storage) {
    'use strict';

    var api;
    var connection;
    var observable = new Observable();
    var socket = io();
    var servicePoints = [];
    var connectionTimes = 0;
    var myself;

    function initEvents() {
        socket.on('disconnect', function () {
            //TODO
        });
        socket.on('reconnect', function () {
            //TODO
        });
        socket.on('connect', function () {
            connectionTimes++;
            updateClient(connectionTimes);
        });
        socket.on('dots', function listenMessage(message) {
            if (message.extend) {
                if (message.type) {
                    observable.propertyChange(message.type, message.extend);
                }
            }
        });
    }

    initEvents();

    function send(data, key) {
        return new Promise(function (resolve) {
            socket.emit(key || 'dots', JSON.stringify(data), function (response) {
                resolve(response);
            });
        });
    }

    function updateClient(connectionTimes) {
        if (connectionTimes === 1) {
            myself = storage.getClient();
            connectionTimes += myself ? 1 : 0;
        }
        if (connectionTimes === 1) {
            api.send({}, 'new_client').then(function (data) {
                myself = data;
                storage.setClient(myself);
            });
        } else {
            api.send(myself, 'client_reconnect').then(function (data) {
                myself = data;
                storage.setClient(myself);
            });
        }
    }

    api = {
        send: send,
        addListener: function (property, listener) {
            socket.on(property, listener);
            //observable.addListener(property, listener);
            return api;
        },
        getMyself: function () {
            return api.send({}, 'get_myself');
        },
        listen: {
            add_dot: 'add_dot',
            add_client: 'add_client',
            invite_player: 'invite_player'
        },
        getId: function () {
            return socket.id;
        }
    };
    return api;
});