define([
    'common/module.transport',
    'utils/service-utils',
    'utils/constants'
], function (Transport, serviceUtils, Constants) {
    'use strict';

    var api;
    var InviteApi = Constants.API.INVITE;
    var GameApi = Constants.API.GAME;

    api = {
        listen: {
            ask: serviceUtils.createListener(InviteApi.INVITE),
            success: serviceUtils.createListener(InviteApi.SUCCESS),
            successToLate: serviceUtils.createListener(InviteApi.SUCCESS_TO_LATE),
            reject: serviceUtils.createListener(InviteApi.REJECT),
            rejectToLate: serviceUtils.createListener(InviteApi.REJECT_TO_LATE),
            cancel: serviceUtils.createListener(GameApi.CANCEL)
        },
        ask: function (clientId) {
            return Transport.send(InviteApi.INVITE, {clientId: clientId});
        },
        success: function (clientId) {
            return Transport.send(InviteApi.SUCCESS, {clientId: clientId});
        },
        successToLate: function (clientId) {
            return Transport.send(InviteApi.SUCCESS_TO_LATE, {clientId: clientId});
        },
        reject: function (clientId) {
            return Transport.send(InviteApi.REJECT, {clientId: clientId});
        },
        cancelGame: function (gameId) {
            return Transport.send(GameApi.CANCEL, {gameId: gameId});
        }
    };

    return api;
});
