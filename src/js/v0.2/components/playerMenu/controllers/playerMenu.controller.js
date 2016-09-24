define([
    'angular',
    'module.observable',
    'business/game.storage',
    'common/events',
    'business/business.invite',
    'components/playerMenu/playerMenu.module'
], function(angular, Observable, gameStorage, Events, inviteBusiness) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope) {
        var vm = this,
            observable = Observable.instance;

        vm.isMenuClosed = true;
        vm.opponent = gameStorage.getGameOpponent();

        vm.cancelGame = function() {
            var game = gameStorage.getGame();
            if (vm.opponent && game) {
                inviteBusiness.cancel(vm.opponent._id, game._id);
            }
        };

        observable.on(Events.REFRESH_GAME, function() {
            vm.opponent = gameStorage.getGameOpponent();
            $scope.$apply();
        });

        observable.on(Events.MENU_VISIBILITY, function(isVisible) {
            vm.isMenuClosed = !isVisible;
        });

        observable.on(Events.CREATE_GAME, function(message) {
            vm.opponent = message.opponent;
            $scope.$apply();
        });

        observable.on(Events.CANCEL_GAME, function() {
            delete vm.opponent;
            $scope.$apply();
        });
    }
});