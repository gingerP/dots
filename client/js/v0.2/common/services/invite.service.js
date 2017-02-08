define([
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events'
], function (Transport, serviceUtils, BackendEvents) {
    'use strict';

    var api;

    api = {
        listen: {
            ask: serviceUtils.createListener(BackendEvents.INVITE.INVITE),
            success: serviceUtils.createListener(BackendEvents.INVITE.SUCCESS),
            successToLate: serviceUtils.createListener(BackendEvents.INVITE.SUCCESS_TO_LATE),
            reject: serviceUtils.createListener(BackendEvents.INVITE.REJECT),
            rejectToLate: serviceUtils.createListener(BackendEvents.INVITE.REJECT_TO_LATE),
            cancel: serviceUtils.createListener(BackendEvents.GAME.CANCEL)
        },
        ask: function (clientId) {
            return Transport.send(
                serviceUtils.createInvitePack(BackendEvents.INVITE.INVITE, clientId),
                BackendEvents.INVITE.INVITE
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
                serviceUtils.createInvitePack(BackendEvents.GAME.CANCEL, null, {gameId: gameId}),
                BackendEvents.GAME.CANCEL
            );
        }
    };

    return api;
});
