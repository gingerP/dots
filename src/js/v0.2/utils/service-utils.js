define([
    'common/module.transport',
    'lodash'
], function(Transport, _) {
    'use strict';

    var api;

    function getClients(clients) {
        return _.isArray(clients)
            ? clients
            : (clients ? [clients] : []);
    }

    api = {
        createGenericPack: function(type, clients, extend) {
            return {
                type: type,
                clients: getClients(clients),
                extend: extend || {}
            };
        },
        createInvitePack: function(type, client, extend) {
            return api.createGenericPack(
                type,
                client,
                extend
            );
        },
        createGamePack: function(type, extend) {
            return {
                type: type,
                extend: extend
            };
        },
        createListener: function createListener(event) {
            return function(listener) {
                Transport.addListener(event, listener);
            };
        }
    };

    return api;
});
