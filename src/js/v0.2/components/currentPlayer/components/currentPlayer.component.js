define([
    'angular',
    'components/currentPlayer/currentPlayer.module',
    'components/currentPlayer/controllers/currentPlayer.controller',
    'components/notification/components/notification.component'
], function(angular) {
    'use strict';

    angular.module('currentPlayer.module').component('currentPlayer', {
        bindings: {},
        controller: 'currentPlayerCtrl',
        controllerAs: 'currentPlayerCtrl',
        templateUrl: '/static/js/v0.2/components/currentPlayer/partials/currentPlayer.template.html'
    });

});
