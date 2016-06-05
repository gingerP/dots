define([
    'angular',
    /*'module.game.business',*/
    '../playerScore.module'
], function(angular, Business) {
    'use strict';

    angular.module('playerScore.module').controller('playerScoreCtrl', PlayerScoreController);

    function PlayerScoreController($scope) {
       /* var vm = this,
            scope = $scope;
        vm.clientsList = [{id: 111111111111111111}];

        Business.addListener(Business.listen.add_client, listenPlayers, true);

        function listenPlayers(pack) {
            vm.clientsList.push(pack);
            scope.$apply();
        }*/

    }
});
