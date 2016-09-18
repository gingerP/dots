define([
    'angular',
    'components/utils/scope.utils',
    'business/game.storage',
    'components/constants/events.constant',
    'business/business.invite',
    'components/playerMenu/playerMenu.module'
], function(angular, observable, scopeUtils, gameStorage, events, inviteBusiness) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope) {
        var vm = this;

        vm.isMenuClosed = true;
        vm.opponent = gameStorage.getOpponent();

        vm.cancelGame = function() {
            if (vm.opponent) {
                inviteBusiness.cancel(vm.opponent._id);
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