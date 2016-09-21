define([
    'angular',
    'module.observable',
    'module.backend.service',
    '../invites.list.module'
], function(angular, Observable, backend) {
    'use strict';

    angular.module('invites.list.module').controller('invitesListCtrl', invitesListCtrl);

    function invitesListCtrl($rootScope, $scope, events) {
        var vm = this,
            observable = Observable.instance;

        vm.invitesList = [];
        vm.isInvitesListVisible = true;

        vm.triggerListVisibility = function() {
            vm.isInvitesListVisible = !vm.isInvitesListVisible;
        };

        vm.submitInvite = function(client) {
            backend.emit.inviteSuccess(client._id);
        };

        vm.rejectInvite = function(client) {
            backend.emit.inviteReject(client._id);
        };

        backend.listen.invitePlayer(function(message) {
            if (message.from) {
                vm.invitesList.push(message.from);
                observable.emit(events.INVITES_VISIBILITY, true);
                $scope.$apply();
            }
        });
    }
});