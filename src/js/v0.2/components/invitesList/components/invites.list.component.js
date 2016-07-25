define([
    'angular',
    '../invites.list.module',
    '../controllers/invites.list.controller'
], function(angular) {
    'use strict';

    angular.module('invites.list.module').component('invitesList', {
        bindings: {},
        controller: 'invitesListCtrl',
        controllerAs: 'invitesListCtrl',
        templateUrl: '/static/js/v0.2/components/invitesList/partials/invites.list.template.html'
    });
});
