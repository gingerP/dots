define([
    'module.observable',
    'socket',
    'q',
    'common/events',
    'common/backend-events',
    'services/business/game.storage'
], function (Observable, io, q, Events, BackendEvents, gameStorage) {
    'use strict';

    var api;
    var observable = Observable.instance;
    var socket = io({'sync disconnect on unload': true });
    var connectionTimes = 0;
    var myself;

    function initEvents() {
        socket.on('error', function (error) {
            console.error(error);
        });
        socket.on('disconnect', function () {
        });
        socket.on('reconnect', function (/*client*/) {
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
        return new Promise(function (resolve, reject) {
            socket.emit(key || 'dots', JSON.stringify(data), function (response) {
                if (response.error) {
                    return reject(response.error);
                }
                return resolve(response.data);
            });
        });
    }

    function updateClient() {
        myself = gameStorage.getClient();
        if (connectionTimes === 1) {
            connectionTimes += myself ? 1 : 0;
        }
        if (connectionTimes === 1 || !myself) {
            api.send({}, BackendEvents.CLIENT.NEW).then(function (data) {
                myself = data;
                gameStorage.setClient(myself);
                observable.emit(Events.REFRESH_MYSELF);
            });
        } else {
            api.send(myself._id, BackendEvents.CLIENT.RECONNECT).then(function (data) {
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
            return api.send({}, BackendEvents.CLIENT.MYSELF.GET);
        },
        getId: function () {
            return socket.id;
        }
    };
    return api;
});