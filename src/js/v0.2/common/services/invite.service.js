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
            invitePlayer: serviceUtils.createListener(events.invite_player),
            inviteSuccessPlayer: serviceUtils.createListener(events.success_invite_player),
            inviteSuccessPlayerToLate: serviceUtils.createListener(events.success_invite_player_to_late),
            inviteRejectPlayer: serviceUtils.createListener(events.reject_invite_player),
            inviteRejectPlayerToLate: serviceUtils.createListener(events.reject_invite_player_to_late),
            cancelGame: serviceUtils.createListener(events.cancel_game)
        },
        inviteAsk: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.invite_player, clientId), events.invite_player);
        },
        inviteSuccess: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.success_invite_player, clientId), events.success_invite_player);
        },
        inviteReject: function(clientId) {
            return Transport.send(serviceUtils.createInvitePack(events.reject_invite_player, clientId), events.reject_invite_player);
        }
    };

    return api;
});