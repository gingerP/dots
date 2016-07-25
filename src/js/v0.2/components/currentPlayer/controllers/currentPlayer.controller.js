define([
    'angular',
    'module.game.business',
    'module.backend.service',
    '../currentPlayer.module'
], function (angular, Business, backend) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope) {
        var vm = this,
            scope = $scope;

        vm.myself;

        vm.nextPlayer = function nextPlayer() {

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
