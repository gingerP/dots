define([
    'angular',
    'module.observable',
    'common/events',
    'business/game.storage',
    'business/module.game.business',
    'components/active-game/active-game.module',
    'components/utils/scope.utils'
], function (angular, Observable, Events, GameStorage, GameBusiness) {
    'use strict';

    angular.module('active-game.module').controller('activeGameCtrl', ActiveGameCtrl);

    function ActiveGameCtrl($scope, scopeUtils) {
        var vm = this,
            observable = Observable.instance;

        function onRefreshGame() {
            vm.opponent = GameStorage.getGameOpponent();
            scopeUtils.apply($scope);
        }

        function cancelGame() {
            GameBusiness.cancelGame();
        }

        observable.on(Events.REFRESH_GAME, onRefreshGame);
        vm.cancelGame = cancelGame;
    }
});
