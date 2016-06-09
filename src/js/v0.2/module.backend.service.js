define([
    'module.transport',
    'module.observable'
], function(Transport, Observable) {
    'use strict';

    var observable = new Observable();
    var api;
    var createPack = {
        invite: function(client, action) {
            return createGenericPack(
                api.event.invite,
                client,
                {
                    action: action
                }
            )
        }
    };
    function createGenericPack(type, clients, extend) {
        return {
            type: type,
            clients: Array.isArray(clients) ? clients : [clients],
            extend: extend
        }
    }


    function listen(type, listener) {
        Transport.addListener(type, listener);
    }

    function addDot() {

    }

    function invitePlayer() {

    }

    function cancelGame() {

    }

    api = {
        on: listen,
        emit: {
            addDot: addDot,
            invitePlayer: invitePlayer,
            cancelGame: cancelGame,
            invite: {
                ask: function(client) {
                    return Transport.sendData(createPack.invite(client, 'ask'));
                },
                success: function(client) {
                    return Transport.sendData(createPack.invite(client, 'success'));
                },
                reject: function(client) {
                    return Transport.sendData(createPack.invite(client, 'reject'));
                }
            }
        },
        event: {
            invite: 'invite',
            add_dot: 'add_dot',
            add_client: 'add_client'
        },
        getId: function() {
          return Transport.getId();
        }
    };

    return api;
});
