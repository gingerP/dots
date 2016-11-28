define([
    'angular',
    'module.observable',
    'business/game.storage',
    'common/events',
    'business/module.game.business',
    'components/utils/scope.utils',
    'components/playerMenu/playerMenu.module'
], function (angular, Observable, gameStorage, Events, GameBusiness) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope, scopeUtils) {
        var vm = this,
            observable = Observable.instance;

        function onRefreshGame() {
            vm.opponent = gameStorage.getGameOpponent();
            scopeUtils.apply($scope);
        }

        function onMenuVisibilityChanged(isVisible) {
            vm.isMenuClosed = !isVisible;
            scopeUtils.apply($scope);
        }

        function onCreatedGame(message) {
            vm.opponent = message.opponent;
            scopeUtils.apply($scope);
        }

        function onCanceledGame() {
            delete vm.opponent;
        }

        vm.isMenuClosed = true;
        vm.opponent = gameStorage.getGameOpponent();

        vm.cancelGame = function () {
            GameBusiness.cancelGame();
        };

        observable.on(Events.REFRESH_GAME, onRefreshGame);
        observable.on(Events.MENU_VISIBILITY, onMenuVisibilityChanged);
        observable.on(Events.CREATE_GAME, onCreatedGame);
        observable.on(Events.CANCEL_GAME, onCanceledGame);
    }
});
