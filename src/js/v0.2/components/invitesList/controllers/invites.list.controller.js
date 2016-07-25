define([
    'angular',
    'module.backend.service',
    '../invites.list.module'
], function(angular, backend) {
    'use strict';

    angular.module('invites.list.module').controller('invitesListCtrl', invitesListCtrl);

    function invitesListCtrl($scope) {
        var vm = this;

        vm.invitesList = [];

        backend.listen.invitePlayer(function(message) {
            if (message.from) {
                vm.invitesList.push(message.from);
                $scope.$apply();
            }
        });
    }
});