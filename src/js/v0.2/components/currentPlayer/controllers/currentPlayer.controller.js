define([
    'angular',
    'module.game.business',
    '../currentPlayer.module'
], function (angular, Business) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope) {
        var vm = this,
            scope = $scope;
        vm.players = [];
        vm.activePlayer;

        vm.nextPlayer = function nextPlayer() {

        };

        init();

        Business.addListener(Business.listen.add_active_player, listenAddActivePlayers, true);
        Business.addListener(Business.listen.change_active_player, listenActivePlayer, true);

        function listenAddActivePlayers() {
            vm.players = Business.getPlayers();
            scope.$apply();
        }

        function listenActivePlayer(player) {
            vm.activePlayer = player;
        }

        function init() {
            vm.players = Business.getPlayers();
            vm.activePlayer = Business.getActivePlayer();
        }
    }
});
