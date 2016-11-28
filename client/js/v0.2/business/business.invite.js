define([
    'common/services/invite.service',
    'module.observable',
    'business/game.storage',
    'business/module.game.business',
    'common/events',
    'q'
], function(inviteService, Observable, GameStorage, GameBusiness, events, q) {
    'use strict';

    var api;
    var observable = Observable.instance;

    function notAvailable() {
        return q.thenReject(false);
    }

    function getOpponent(clientA, clientB) {
        var myself = GameStorage.getClient();
        return clientA._id === myself._id ? clientB : clientA;
    }

    function createGame(message) {
        var beginner, beginnerGamer, myself, opponent = GameStorage.getGameOpponent();
        GameStorage.setOpponent(message.opponent);
        GameStorage.setGame(message.game);
        beginner = message.from;
        myself = GameStorage.getGameClient();
        opponent = GameStorage.getGameOpponent();
        if (myself.getId() === beginner._id) {
            beginnerGamer = myself;
        } else if (opponent.getId() === beginner._id) {
            beginnerGamer = opponent;
        }
        if (beginnerGamer) {
            GameBusiness.makePlayerActive(beginnerGamer);
        }
    }

    inviteService.listen.ask(function(message) {
        if (message.from) {
            observable.emit(events.INVITE, message);
        }
    });

    inviteService.listen.success(function(message) {
        var opponent;
        if (!GameStorage.hasOpponent()) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
                createGame(message);
                observable.emit(events.CREATE_GAME, message);
            }
        } else {
            opponent = getOpponent(message.to, message.from);
            inviteService.successToLate(opponent._id);
        }
    });

    inviteService.listen.reject(function(message) {
        if (!GameStorage.hasOpponent()) {
            if (message.to) {
                observable.emit(events.INVITE_REJECT, message);
            }
        }
    });

    api = {
        ask: function(clientId) {
            if (!GameStorage.hasOpponent()) {
                return inviteService.ask(clientId);
            }
            return notAvailable();
        },
        success: function(clientId) {
            return inviteService.success(clientId);
        },
        reject: function(clientId) {
            return inviteService.reject(clientId);
        }
    };

    return api;
});
