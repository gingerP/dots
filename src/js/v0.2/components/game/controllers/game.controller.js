define([
    'angular',
    'business/module.game.business',
    'graphics/module.game.graphics',
    'common/module.observable.angular',
    'module.storage',
    'components/constants/events.constant',
    'module.backend.service',
    'components/utils/game.utils',
    'components/game/game.module'
], function(angular, business, graphics, Observable, storage, events, backend, gameUtils) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {

        function getOpponent(clientA, clientB) {
            var myself = storage.getClient();
            return clientA._id === myself._id ? clientB : clientA;
        }

        backend.listen.invitePlayer(function(message) {
            if (message.from) {
                $rootScope.$emit(events.INVITE, message);
            }
        });

        backend.listen.inviteSuccessPlayer(function(message) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
                storage.setOpponent(message.opponent);
                storage.setGame(message.game);
                $rootScope.$emit(events.CREATE_GAME, message);
            }
        });

        backend.listen.inviteRejectPlayer(function(message) {
            if (message.to) {
                $rootScope.$emit(events.INVITE_REJECT, message);
            }
        });

        backend.listen.cancelGame(function(message) {
            var currentGame = storage.getGame();
            var opponent = storage.getOpponent();
            if (message.game._id && currentGame._id && currentGame._id === message.game._id) {
                storage.clearGame();
                storage.clearOpponent();
                message.opponent = opponent;
                $rootScope.$emit(events.CANCEL_GAME, message);
            }
        });

        $rootScope.$on(events.GAME_PANE_RENDER, function() {
            var xSize = 40;
            var ySize = 40;
            var radius = 2;
            business.init(graphics, new Observable($rootScope));
            graphics.init('#game-pane', xSize, ySize, gameUtils.generateVertexes(xSize, ySize, radius)).setBusiness(business);
        });
    }
});