define([
    'common/services/invite.service',
    'module.observable',
    'business/game.storage',
    'common/events',
    'q'
], function(inviteService, Observable, gameStorage, events, q) {
    'use strict';

    var api;
    var observable = Observable.instance;

    function notAvailable() {
        return q.thenReject(false);
    }

    function isInviteAvailable() {
        return !gameStorage.hasOpponent();
    }

    function getOpponent(clientA, clientB) {
        var myself = gameStorage.getClient();
        return clientA._id === myself._id ? clientB : clientA;
    }

    inviteService.listen.ask(function(message) {
        if (message.from) {
            observable.emit(events.INVITE, message);
        }
    });

    inviteService.listen.success(function(message) {
        var opponent;
        if (!gameStorage.hasOpponent()) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
                gameStorage.setOpponent(message.opponent);
                gameStorage.setGame(message.game);
                observable.emit(events.CREATE_GAME, message);
            }
        } else {
            opponent = getOpponent(message.to, message.from);
            inviteService.successToLate(opponent._id);
        }
    });

    inviteService.listen.reject(function(message) {
        if (!gameStorage.hasOpponent()) {
            if (message.to) {
                observable.emit(events.INVITE_REJECT, message);
            }
        }
    });

    inviteService.listen.cancel(function(message) {
        var currentGame;
        var opponent;
        if (gameStorage.hasOpponent()) {
            currentGame = gameStorage.getGame();
            opponent = gameStorage.getOpponent();
            if (currentGame._id && currentGame._id === message.game._id) {
                if (!message.game && message.game._id) {
                    console.warn('Game does not found!');
                }
                gameStorage.clearGame();
                gameStorage.clearOpponent();
                message.opponent = opponent;
                observable.emit(events.CANCEL_GAME, message);
            }
        }
    });

    api = {
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
        cancel: function(clientId, gameId) {
            return inviteService.cancel(clientId, gameId);
        }
    };

    return api;
});
