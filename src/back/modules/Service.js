var _ = require('lodash');
var Observable = require('../../../bin/Observable').class;
var observable = new Observable();
var service = (function() {
    'use strict';
    var api;
    var socket;
    var TYPE = 'dots';

    function createGenericPack(type, extend) {
        return {
            type: type,
            extend: extend
        }
    }

    function addDefaultListener(type) {
        return function(data) {
            observable.propertyChange(type, data);
        }
    }

    function init() {
        var e = api.event;
        socket.addListener(e.new_connection, addDefaultListener(e.new_connection));
        socket.addListenerIn(e.add_dot, addDefaultListener(e.add_dot));
        socket.addListenerIn(e.update_client_id, addDefaultListener(e.update_client_id));
        socket.addListenerIn(e.invite, addDefaultListener(e.invite));
    }

    api = {
        init: function(_socket_) {
            socket = _socket_;
            init();
            return api;
        },
        notifyClients: function(clients, type, data) {
            var pack = createGenericPack(type, data);
            _.forEach(clients, function(client) {
                client.getConnection().sendData(pack, TYPE);
            });
            return api;
        },
        notifyClient: function(client, type, data) {
            var pack = createGenericPack(type, data);
            client.getConnection().sendData(pack, TYPE);
            return api;
        },
        on: function(event, listener) {
            observable.addListener(event, listener);
            return api;
        },
        event: {
            new_connection: 'new_connection',
            add_client: 'add_client',
            add_dot: 'add_dot',
            update_client_id: 'update_client_id',
            invite: 'invite'
        }

    };

    return api;
})();

module.exports = service;