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
        createInvitePack: function(type, client, extend) {
            return api.createGenericPack(
                type,
                client,
                extend
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