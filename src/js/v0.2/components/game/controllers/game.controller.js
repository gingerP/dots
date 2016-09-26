define([
    'angular',
    'module.observable',
    'business/business.invite',
    'module.game.business',
    'module.game.graphics',
    'business/game.storage',
    'common/events',
    'module.backend.service',
    'utils/game-utils',
    'components/game/game.module'
], function(angular, Observable, inviteBusiness, business, graphics, gameStorage, events, backend, gameUtils) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {
        var observable = Observable.instance;
        observable.on(events.GAME_PANE_RENDER, function() {
            var xSize = 40;
            var ySize = 40;
            var radius = 2;
            business.init(graphics);
            graphics.init('#game-pane', xSize, ySize, gameUtils.generateVertexes(xSize, ySize, radius)).setBusiness(business);
        });
    }
});