define([
    'angular',
    'components/tabbar/tabbar.module',
    'components/tabbar/controllers/tabbar.controller'
], function (angular) {
    'use strict';

    angular.module('tabbar.module').component('tabbar', {
        bindings: {
            context: '<'
        },
        controller: 'tabbarCtrl',
        controllerAs: 'tabbarCtrl',
        templateUrl: '/static/js/v0.2/components/tabbar/partials/tabbar.template.html',
        transclude: true
    });
});
