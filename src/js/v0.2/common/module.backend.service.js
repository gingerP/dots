define([
    'module.transport',
    'module.observable',
    'business/game.storage'
], function(Transport, Observable, storage) {
    'use strict';

    var observable = new Observable.class();
    var api;
    var myself;
    var events = {
        invite_player: 'invite_player',
        reject_invite_player: 'reject_invite_player',
        reject_invite_player_to_late: 'reject_invite_player_to_late',
        success_invite_player: 'success_invite_player',
        success_invite_player_to_late: 'success_invite_player_to_late',
        cancel_game: 'cancel_game'
    };

    function listen(type, listener) {
        Transport.addListener(type, listener);
    }

    function addDot() {

    }

    function getMyself() {
        return Transport.getMyself();
    }

    api = {
        on: listen,
        listen: {

        },
        emit: {
            addDot: addDot,
            getMyself: getMyself,
            clientReconnect: function(client) {
                return Transport.send(client, 'client_reconnect');
            },
            newClient: function() {
                return Transport.send({}, 'new_client');
            },
            cancelGame: function(clientOpponentId) {
                return Transport.send(createGenericPack(events.cancel_game, clientOpponentId), events.cancel_game);
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
