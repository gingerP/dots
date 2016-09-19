define([
    'angular',
    'module.observable',
    'business/game.storage',
    'components/constants/events.constant',
    'business/business.invite',
    'components/playerMenu/playerMenu.module'
], function(angular, Observable, gameStorage, events, inviteBusiness) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope) {
        var vm = this,
            observable = Observable.instance;

        vm.isMenuClosed = true;
        vm.opponent = gameStorage.getOpponent();

        vm.cancelGame = function() {
            var game = gameStorage.getGame();
            if (vm.opponent && game) {
                inviteBusiness.cancel(vm.opponent._id, game._id);
            }
        };

        $scope.$on('$destroy', observable.on(events.MENU_VISIBILITY, function(isVisible) {
            vm.isMenuClosed = !isVisible;
        }));

        $scope.$on('$destroy', observable.on(events.CREATE_GAME, function(message) {
            vm.opponent = message.opponent;
            $scope.$apply();
        }));

        $scope.$on('$destroy', observable.on(events.CANCEL_GAME, function() {
            delete vm.opponent;
            $scope.$apply();
        }));
    }
});