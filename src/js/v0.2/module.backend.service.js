define([
    'module.transport',
    'module.observable',
    'module.storage'
], function(Transport, Observable, storage) {
    'use strict';

    var observable = new Observable();
    var api;
    var myself;
    var createPack = {
        invite: function(type, client) {
            return createGenericPack(
                type,
                client
            )
        }
    };
    var events = {
        invite_player: 'invite_player',
        reject_invite_player: 'reject_invite_player',
        reject_invite_player_to_late: 'reject_invite_player_to_late',
        success_invite_player: 'success_invite_player',
        success_invite_player_to_late: 'success_invite_player_to_late',
        cancel_game: 'cancel_game'
    };

    function createGenericPack(type, clients, extend) {
        return {
            type: type,
            clients: Array.isArray(clients) ? clients : [clients],
            extend: extend || {}
        }
    }


    function listen(type, listener) {
        Transport.addListener(type, listener);
    }

    function addDot() {

    }

    function invitePlayer() {

    }

    function getMyself() {
        return Transport.getMyself();
    }

    function createListener(event) {
        return function(listener) {
            listen(event, listener);
        }
    }

    api = {
        on: listen,
        listen: {
            invitePlayer: createListener(events.invite_player),
            inviteSuccessPlayer: createListener(events.success_invite_player),
            inviteSuccessPlayerToLate: createListener(events.success_invite_player_to_late),
            inviteRejectPlayer: createListener(events.reject_invite_player),
            inviteRejectPlayerToLate: createListener(events.reject_invite_player_to_late)
        },
        emit: {
            addDot: addDot,
            invitePlayer: invitePlayer,
            getMyself: getMyself,
            clientReconnect: function(client) {
                return Transport.send(client, 'client_reconnect');
            },
            newClient: function() {
                return Transport.send({}, 'new_client');
            },
            cancelGame: function(clientOpponentId) {
                return Transport.send({
                    opponent: clientOpponentId
                }, events.cancel_game);
            },
            inviteAsk: function(clientId) {
                return Transport.send(createPack.invite(events.invite_player, clientId), events.invite_player);
            },
            inviteSuccess: function(clientId) {
                return Transport.send(createPack.invite(events.success_invite_player, clientId), events.success_invite_player);
            },
            inviteReject: function(clientId) {
                return Transport.send(createPack.invite(events.reject_invite_player, clientId), events.reject_invite_player);
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
