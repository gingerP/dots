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
], function(angular, Observable, inviteBusiness, business, graphics, storage, events, backend, gameUtils) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {
        var observable = Observable.instance;

        function getOpponent(clientA, clientB) {
            var myself = storage.getClient();
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
                storage.setServerOpponent(message.opponent);
                storage.setGame(message.game);
                observable.emit(events.CREATE_GAME, message);
            }
        });

        inviteBusiness.listen.reject(function(message) {
            if (message.to) {
                observable.emit(events.INVITE_REJECT, message);
            }
        });

        inviteBusiness.listen.cancel(function(message) {
            var currentGame = storage.getGame();
            var opponent = storage.getOpponent();
            if (message.game._id && currentGame._id && currentGame._id === message.game._id) {
                storage.clearGame();
                storage.clearOpponent();
                message.opponent = opponent;
                observable.emit(events.CANCEL_GAME, message);
            }
        });

        observable.on(events.GAME_PANE_RENDER, function() {
            var xSize = 40;
            var ySize = 40;
            var radius = 2;
            business.init(graphics, new Observable($rootScope));
            graphics.init('#game-pane', xSize, ySize, gameUtils.generateVertexes(xSize, ySize, radius)).setBusiness(business);
        });
    }
});