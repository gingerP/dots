define([
    'angular',
    '../playerScore.module',
    '../controllers/playerScore.controller'
], function(angular) {
    'use strict';

    angular.module('playerScore.module').component('playerScore', {
        bindings: {},
        controller: 'playerScoreCtrl',
        controllerAs: 'playerScoreCtrl',
        templateUrl: '/static/js/v0.2/components/playerScore/partials/playerScore.template.html'
    });

});
