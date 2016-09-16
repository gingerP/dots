define([
    'module.transport'
], function(Transport) {
    'use strict';

    var api;

    api = {
        createGenericPack: function(type, clients, extend) {
            return {
                type: type,
                clients: Array.isArray(clients) ? clients : [clients],
                extend: extend || {}
            }
        },
        createInvitePack: function(type, client) {
            return api.createGenericPack(
                type,
                client
            )
        },
        createListener: function createListener(event) {
            return function(listener) {
                Transport.addListener(event, listener);
            }
        }
    };

    return api;
});