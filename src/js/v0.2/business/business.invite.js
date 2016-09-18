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
        return !gameStorage.hasOpponent();
    }

    api = {
        listen: {
            ask: function(listener) {
                inviteService.listen.ask(function(data) {
                    if (!gameStorage.hasOpponent()) {
                        listener(data);
                    }
                });
            },
            success: function(listener) {
                inviteService.listen.success(function(data) {
                    if (!gameStorage.hasOpponent()) {
                        listener(data);
                    }
                });
            },
            reject: function(listener) {
                inviteService.listen.reject(function(data) {
                    if (!gameStorage.hasOpponent()) {
                        listener(data);
                    }
                });
            },
            cancel: function(listener) {
                inviteService.listen.cancel(function(data) {
                    if (gameStorage.hasOpponent()) {
                        listener(data);
                    }
                });
            }
        },
        ask: function(clientId) {
            if (!gameStorage.hasOpponent()) {
                return inviteService.ask(clientId);
            }
            return notAvailable();
        },
        success: function(clientId) {
            return inviteService.success(clientId);
        },
        reject: function(clientId) {
            return inviteService.reject(clientId);
        },
        cancel: function(clientId) {
            return inviteService.cancel(clientId);
        }
    };

    return api;
});