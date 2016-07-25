define([
    'angular',
    '../accordion.module',
    '../../game/constant/events.constant'
], function(angular) {
    'use strict';

    angular.module('accordion.module').controller('accordionCtrl', accordionCtrl);

    function accordionCtrl($rootScope, $scope, events) {
        var vm = this;

        $scope.$on('$destroy', $rootScope.$on(events.INVITES_VISIBILITY, function(events, isInvitesVisible) {
            vm.isInvitesVisible = isInvitesVisible;
            $scope.$apply();
        }));

    }
});