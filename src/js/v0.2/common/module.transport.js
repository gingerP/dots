define([
    'module.observable',
    'socket',
    'q',
    'common/events',
    'business/game.storage'
], function (Observable, io, q, Events, gameStorage) {
    'use strict';

    var api;
    var connection;
    var observable = Observable.instance;
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
            updateClient();
        });
        socket.on('dots', function listenMessage(message) {
            if (message.extend) {
                if (message.type) {
                    observable.emit(message.type, message.extend);
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

    function updateClient() {
        if (connectionTimes === 1) {
            myself = gameStorage.getClient();
            connectionTimes += myself ? 1 : 0;
        }
        if (connectionTimes === 1) {
            api.send({}, 'new_client').then(function (data) {
                myself = data;
                gameStorage.setClient(myself);
                observable.emit(Events.REFRESH_MYSELF);
            });
        } else {
            api.send(myself, 'client_reconnect').then(function (data) {
                myself = data;
                gameStorage.setClient(myself);
                observable.emit(Events.REFRESH_MYSELF);
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