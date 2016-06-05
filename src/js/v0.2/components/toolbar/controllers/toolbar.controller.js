define([
    'angular',
    'module.game.business',
    '../toolbar.module'
], function(angular, Business) {
    'use strict';

    angular.module('toolbar.module').controller('toolbarCtrl', ToolbarController);

    function ToolbarController($scope) {
/*        var vm = this,
            scope = $scope;
        vm.clientsList = [{id: 111111111111111111}];

        Business.addListener(Business.listen.add_client, listenPlayers, true);

        function listenPlayers(pack) {
            vm.clientsList.push(pack);
            scope.$apply();
        }*/

    }
});
