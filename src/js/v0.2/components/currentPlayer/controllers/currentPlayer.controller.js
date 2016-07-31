define([
    'angular',
    'module.game.business',
    'module.backend.service',
    'components/constants/events.constant',
    'components/currentPlayer/currentPlayer.module'
], function (angular, Business, backend, events) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope) {
        var vm = this,
            scope = $scope;

        vm.myself;
        vm.isMenuOpened = false;

        vm.nextPlayer = function nextPlayer() {

        };

        vm.triggerOpenMenu = function() {
            vm.isMenuOpened = !vm.isMenuOpened;
            $rootScope.$emit(events.MENU_VISIBILITY, vm.isMenuOpened);
        };

        init();

        function init() {
            backend.emit.getMyself().then(function(client) {
                vm.myself = client;
                $scope.$apply();
            })
        }
    }
});
