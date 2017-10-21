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
            return Transport.send(BackendEvents.INVITE.INVITE, {clientId: clientId});
        },
        success: function (clientId) {
            return Transport.send(BackendEvents.INVITE.SUCCESS, {clientId: clientId});
        },
        successToLate: function (clientId) {
            return Transport.send(BackendEvents.INVITE.SUCCESS_TO_LATE, {clientId: clientId});
        },
        reject: function (clientId) {
            return Transport.send(BackendEvents.INVITE.REJECT, {clientId: clientId});
        },
        cancelGame: function (gameId) {
            return Transport.send(BackendEvents.GAME.CANCEL, {gameId: gameId});
        }
    };

    return api;
});
