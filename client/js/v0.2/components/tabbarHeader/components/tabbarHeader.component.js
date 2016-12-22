define([
    'angular',
    'components/tabbarHeader/tabbarHeader.module',
    'components/tabbarHeader/controllers/tabbarHeader.controller'
], function (angular) {
    'use strict';

    angular.module('tabbarHeader.module').component('tabbarHeader', {
        bindings: {
            context: '='
        },
        controller: 'tabbarHeaderCtrl',
        controllerAs: 'tabbarHeaderCtrl',
        templateUrl: '/static/js/v0.2/components/tabbarHeader/partials/tabbarHeader.template.html'
    });
});
