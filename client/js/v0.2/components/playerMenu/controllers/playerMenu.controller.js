define([
    'angular',
    'module.observable',
    'business/game.storage',
    'common/events',
    'components/utils/scope.utils',
    'components/playerMenu/playerMenu.module',
    'components/playerMenu/factories/playerMenuConfig.factory'
], function (angular, Observable, gameStorage, Events) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', PlayerMenuController);

    function PlayerMenuController($scope, scopeUtils, playerMenuConfig) {
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
        vm.config = playerMenuConfig.getConfig();
        vm.TABS = playerMenuConfig.TABS;
        vm.activeTab = vm.TABS.GAMERS;

        observable.on(Events.REFRESH_GAME, onRefreshGame);
        observable.on(Events.MENU_VISIBILITY, onMenuVisibilityChanged);
        observable.on(Events.CREATE_GAME, onCreatedGame);
        observable.on(Events.CANCEL_GAME, onCanceledGame);
    }
});
