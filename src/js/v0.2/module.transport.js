define([
    'observable',
    'socket',
    'q',
    'local.storage'
], function (Observable, io, q, Storage) {
    'use strict';

    var api;
    var connection;
    var observable = new Observable();
    var socket = io();
    var servicePoints = [];
    var connectionTimes = 0;
    var myself;
    //var storage = initStorage(Storage);

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

    function initStorage() {
        return new Storage({
            // Namespace. Namespace your Basil stored data
            // default: 'b45i1'
            namespace: 'foo',

            // storages. Specify all Basil supported storages and priority order
            // default: `['local', 'cookie', 'session', 'memory']`
            storages: ['cookie', 'session'],

            // expireDays. Default number of days before cookies expiration
            // default: 365
            expireDays: 31
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
            myself = Storage.get('client');
            connectionTimes += myself ? 1 : 0;
        }
        if (connectionTimes === 1) {
            api.send({}, 'new_client').then(function (data) {
                myself = data;
                Storage.set('client', myself);
            });
        } else {
            api.send(myself, 'client_reconnect').then(function (data) {
                myself = data;
                Storage.set('client', myself);
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