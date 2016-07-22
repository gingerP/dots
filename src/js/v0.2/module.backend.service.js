define([
    'module.transport',
    'module.observable'
], function(Transport, Observable) {
    'use strict';

    var observable = new Observable();
    var api;
    var myself;
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

    function getMyself() {
        return Transport.getMyself();
    }

    api = {
        on: listen,
        emit: {
            addDot: addDot,
            invitePlayer: invitePlayer,
            cancelGame: cancelGame,
            getMyself: getMyself,
            clientReconnect: function(client) {
                return Transport.send(client, 'client_reconnect');
            },
            newClient: function() {
                return Transport.send({}, 'new_client');
            },
            inviteAsk: function(client) {
                return Transport.send(createPack.invite(client, 'invite_player'));
            },
            inviteSuccess: function(client) {
                return Transport.send(createPack.invite(client, 'success_invite_player'));
            },
            inviteReject: function(client) {
                return Transport.send(createPack.invite(client, 'reject_invite_player'));
            },
            getClients: function getClients() {
                return Transport.send({}, 'get_clients_list');
            }
        },
        getId: function() {
          return Transport.getId();
        }
    };

    return api;
});
