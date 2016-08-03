define([
    'angular',
    'module.game.business',
    'module.backend.service',
    'components/constants/events.constant',
    'components/utils/scope.utils',
    'module.storage',
    'components/currentPlayer/currentPlayer.module'
], function (angular, Business, backend, events, scopeUtils, storage) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope) {
        var vm = this,
            scope = $scope;

        vm.myself;
        vm.opponent;
        vm.isMenuOpened = false;

        vm.nextPlayer = function nextPlayer() {

        };

        vm.triggerOpenMenu = function () {
            vm.isMenuOpened = !vm.isMenuOpened;
            $rootScope.$emit(events.MENU_VISIBILITY, vm.isMenuOpened);
        };

        backend.emit.getMyself().then(function (client) {
            vm.myself = client;
            $scope.$apply();
        });

        scopeUtils.onRoot($scope, events.CREATE_GAME, function(message) {
            var myself;
            var opponent;
            if (message.to && message.from && message.game) {
                myself = storage.getClient();
                vm.opponent = myself._id === message.to._id ? message.from : message.to;
                $scope.$apply();
            }
        });
    }
});
