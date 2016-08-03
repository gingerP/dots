define([
    'angular',
    'components/utils/scope.utils',
    'components/constants/events.constant',
    'module.storage',
    'module.backend.service',
    'components/playerMenu/playerMenu.module'
], function(angular, scopeUtils, events, storage, backend) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope) {
        var vm = this;

        vm.isMenuClosed = true;
        vm.opponent;

        vm.cancelGame = function() {
            if (vm.opponent) {
                backend.emit.cancelGame(vm.opponent._id);
            }
        };

        scopeUtils.onRoot($scope, events.MENU_VISIBILITY, function(isVisible) {
            vm.isMenuClosed = !isVisible;
        });

        scopeUtils.onRoot($scope, events.CREATE_GAME, function(message) {
            vm.opponent = message.opponent;
            $scope.$apply();
        });

        scopeUtils.onRoot($scope, events.CANCEL_GAME, function() {
            delete vm.opponent;
            $scope.$apply();
        });
    }
});