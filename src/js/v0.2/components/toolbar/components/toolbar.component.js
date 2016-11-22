define([
    'angular',
    '../toolbar.module',
    '../controllers/toolbar.controller'
], function (angular) {
    'use strict';

    angular.module('toolbar.module').component('toolbar', {
        bindings: {},
        controller: 'toolbarCtrl',
        controllerAs: 'toolbarCtrl',
        templateUrl: '/static/js/v0.2/components/toolbar/partials/toolbar.template.html',
        transclude: {
            left: '?transcludeLeft',
            center: 'transcludeCenter',
            right: 'transcludeRight'
        }
    });
});
