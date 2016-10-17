define([
    'angular',
    'components/playerColor/playerColor.module',
    'components/playerColor/controllers/playerColor.controller'
], function (angular) {
    'use strict';

    angular.module('playerColor.module').component('playerColor', {
        bindings: {
            color: '=',
            options: '=?'
        },
        controller: 'playerColorCtrl',
        controllerAs: 'playerColorCtrl',
        templateUrl: '/static/js/v0.2/components/playerColor/partials/playerColor.partial.html'
    });
});

