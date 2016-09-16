define([
    'common/services/invite.service',
    'business/game.storage',
    'q'
], function(inviteService, gameStorage, q) {
    'use strict';

    var api;

    function notAvailable() {
        return q.thenReject(false);
    }

    function isInviteAvailable() {
        return !gameStorage.opponent;
    }

    api = {
        listen: {
            ask: function(listener) {
                inviteService.listen.invitePlayer(function(data) {
                    if (!gameStorage.opponent) {
                        listener(data);
                    }
                });
            },
            success: function(listener) {
                inviteService.listen.inviteSuccessPlayer(function(data) {
                    if (!gameStorage.opponent) {
                        listener(data);
                    }
                });
            },
            reject: function(listener) {
                inviteService.listen.inviteRejectPlayer(function(data) {
                    if (!gameStorage.opponent) {
                        listener(data);
                    }
                });
            },
            cancelGame: function(listener) {
                inviteService.listen.cancelGame(function(data) {
                    if (gameStorage.opponent) {
                        listener(data);
                    }
                });
            }
        },
        ask: function(clientId) {
            if (!gameStorage.opponent) {
                return inviteService.inviteAsk(clientId);
            }
            return notAvailable();
        },
        success: function(clientId) {
            return inviteService.inviteSuccess(clientId);
        },
        reject: function(clientId) {
            return inviteService.inviteReject(clientId);
        },
        cancelGame: function(clientId) {
            return inviteService.cancelGame(clientId);
        }
    };

    return api;
});