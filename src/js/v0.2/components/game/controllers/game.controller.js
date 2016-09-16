define([
    'angular',
    'business/business.invite',
    'business/module.game.business',
    'graphics/module.game.graphics',
    'common/module.observable.angular',
    'module.storage',
    'components/constants/events.constant',
    'module.backend.service',
    'utils/game-utils',
    'components/game/game.module'
], function(angular, inviteBusiness, business, graphics, Observable, storage, events, backend, gameUtils) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {

        function getOpponent(clientA, clientB) {
            var myself = storage.getClient();
            return clientA._id === myself._id ? clientB : clientA;
        }

        inviteBusiness.listen.ask(function(message) {
            if (message.from) {
                $rootScope.$emit(events.INVITE, message);
            }
        });

        inviteBusiness.listen.success(function(message) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
                storage.setOpponent(message.opponent);
                storage.setGame(message.game);
                $rootScope.$emit(events.CREATE_GAME, message);
            }
        });

        inviteBusiness.listen.reject(function(message) {
            if (message.to) {
                $rootScope.$emit(events.INVITE_REJECT, message);
            }
        });

        inviteBusiness.listen.cancelGame(function(message) {
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