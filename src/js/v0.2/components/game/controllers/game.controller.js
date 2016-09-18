define([
    'angular',
    'module.observable',
    'business/business.invite',
    'business/module.game.business',
    'graphics/module.game.graphics',
    'business/game.storage',
    'components/constants/events.constant',
    'module.backend.service',
    'utils/game-utils',
    'components/game/game.module'
], function(angular, Observable, inviteBusiness, business, graphics, gameStorage, events, backend, gameUtils) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {
        var observable = Observable.instance;

        function getOpponent(clientA, clientB) {
            var myself = gameStorage.getClient();
            return clientA._id === myself._id ? clientB : clientA;
        }

        inviteBusiness.listen.ask(function(message) {
            if (message.from) {
                observable.emit(events.INVITE, message);
            }
        });

        inviteBusiness.listen.success(function(message) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
                gameStorage.setOpponent(message.opponent);
                gameStorage.setGame(message.game);
                observable.emit(events.CREATE_GAME, message);
            }
        });

        inviteBusiness.listen.reject(function(message) {
            if (message.to) {
                observable.emit(events.INVITE_REJECT, message);
            }
        });

        inviteBusiness.listen.cancel(function(message) {
            var currentGame = gameStorage.getGame();
            var opponent = gameStorage.getOpponent();
            var client = gameStorage.getClient();
            if (currentGame._id && currentGame._id === message.game._id) {
                if (!message.game && message.game._id) {
                    console.warn('Game does not found!');
                }
                gameStorage.clearGame();
                gameStorage.clearOpponent();
                message.opponent = opponent;
                observable.emit(events.CANCEL_GAME, message);
            }
        });

        observable.on(events.GAME_PANE_RENDER, function() {
            var xSize = 40;
            var ySize = 40;
            var radius = 2;
            business.init(graphics);
            graphics.init('#game-pane', xSize, ySize, gameUtils.generateVertexes(xSize, ySize, radius)).setBusiness(business);
        });
    }
});