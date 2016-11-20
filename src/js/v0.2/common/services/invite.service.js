define([
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events'
], function (Transport, serviceUtils, BackendEvents) {
    'use strict';

    var api;

    api = {
        listen: {
            ask: serviceUtils.createListener(BackendEvents.INVITE.ASK),
            success: serviceUtils.createListener(BackendEvents.INVITE.SUCCESS),
            successToLate: serviceUtils.createListener(BackendEvents.INVITE.SUCCESS_TO_LATE),
            reject: serviceUtils.createListener(BackendEvents.INVITE.REJECT),
            rejectToLate: serviceUtils.createListener(BackendEvents.INVITE.REJECT_TO_LATE),
            cancel: serviceUtils.createListener(BackendEvents.INVITE.CANCEL_GAME)
        },
        ask: function (clientId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.ASK, clientId),
                BackendEvents.INVITE.ASK
            );
        },
        success: function (clientId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.SUCCESS, clientId),
                BackendEvents.INVITE.SUCCESS
            );
        },
        successToLate: function (clientId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.SUCCESS_TO_LATE, clientId),
                BackendEvents.INVITE.SUCCESS_TO_LATE
            );
        },
        reject: function (clientId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.REJECT, clientId),
                BackendEvents.INVITE.REJECT
            );
        },
        cancelGame: function (gameId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.CANCEL_GAME, null, {gameId: gameId}),
                BackendEvents.INVITE.CANCEL_GAME
            );
        }
    };

    return api;
});
