define(
    [
        'module.observable',
        'socket',
        'q',
        'common/events',
        'common/backend-events',
        'services/business/game.storage'
    ],
    /**
     * @module Transport
     * @typedef {{send: function, addListener: function, getMyself: function, getId: function}} Transport
     * @param Observable
     * @param io socket
     * @param q angular q
     * @param Events
     * @param {{BackendEvents}} BackendEvents
     * @param gameStorage
     * @returns {{Transport}} backend transport
     */
    function (Observable, io, q, Events, BackendEvents, gameStorage) {
        /**
         * @exports Transport
         */
        'use strict';

        var api;
        var observable = Observable.instance;
        var socket = io({'sync disconnect on unload': true});
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

        function send(endPoint, data) {
            return new Promise(function (resolve, reject) {
                socket.emit(endPoint, JSON.stringify(data || {}), function (response) {
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
                api.send(BackendEvents.CLIENT.NEW).then(function (data) {
                    myself = data;
                    gameStorage.setClient(myself);
                    observable.emit(Events.REFRESH_MYSELF);
                });
            } else {
                api.send(BackendEvents.CLIENT.RECONNECT, myself._id).then(function (data) {
                    myself = data;
                    gameStorage.setClient(myself);
                    observable.emit(Events.REFRESH_MYSELF);
                });
            }
        }

        function getListenerTrap(endpoint) {
            return function (callback) {
                api.addListener(endpoint, callback);
            };
        }

        api = {
            send: send,
            addListener: function (property, listener) {
                socket.on(property, listener);
                //observable.addListener(property, listener);
                return api;
            },
            getListenerTrap: getListenerTrap,
            getMyself: function () {
                return api.send({}, BackendEvents.CLIENT.MYSELF.GET);
            },
            getId: function () {
                return socket.id;
            }
        };
        return api;
    }
);