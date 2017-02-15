define([
    'angular',
    'components/active-game/active-game.module',
    'components/active-game/controllers/active-game.controller'
], function (angular) {
    'use strict';

    angular.module('active-game.module').component('activeGame', {
        bindings: {},
        controller: 'activeGameCtrl',
        controllerAs: 'activeGameCtrl',
        templateUrl: '/static/js/v0.2/components/active-game/partials/active-game.template.html'
    });
});
