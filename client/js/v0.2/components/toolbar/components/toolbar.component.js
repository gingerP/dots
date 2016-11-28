define([
    'angular',
    'utils/common-utils',
    'components/toolbar/toolbar.module',
    'components/toolbar/controllers/toolbar.controller'
], function (angular, CommonUtils) {
    'use strict';

    CommonUtils.updateDeviceFlag();

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
