define([
    'angular',
    '../currentPlayer.module',
    '../controllers/currentPlayer.controller'
], function(angular) {
    'use strict';

    angular.module('currentPlayer.module').component('currentPlayer', {
        bindings: {},
        controller: 'currentPlayerCtrl',
        controllerAs: 'currentPlayerCtrl',
        templateUrl: '/static/js/v0.2/components/currentPlayer/partials/currentPlayer.template.html'
    });

});
