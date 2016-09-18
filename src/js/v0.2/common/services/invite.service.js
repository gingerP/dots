define([
    'module.transport',
    'utils/service-utils'
], function(Transport, serviceUtils) {
    'use strict';

    var api;
    var events = {
        invite_player: 'invite_player',
        reject_invite_player: 'reject_invite_player',
        reject_invite_player_to_late: 'reject_invite_player_to_late',
        success_invite_player: 'success_invite_player',
        success_invite_player_to_late: 'success_invite_player_to_late',
        cancel_game: 'cancel_game'
    };

    api = {
        listen: {
            ask: serviceUtils.createListener(events.invite_player),
            success: serviceUtils.createListener(events.success_invite_player),
            successToLate: serviceUtils.createListener(events.success_invite_player_to_late),
            reject: serviceUtils.createListener(events.reject_invite_player),
            rejectToLate: serviceUtils.createListener(events.reject_invite_player_to_late),
            cancel: serviceUtils.createListener(events.cancel_game)
        },
        ask: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.invite_player, clientId), events.invite_player);
        },
        success: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.success_invite_player, clientId), events.success_invite_player);
        },
        reject: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.reject_invite_player, clientId), events.reject_invite_player);
        },
        cancel: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.cancel_game, clientId), events.cancel_game);
        }
    };

    return api;
});