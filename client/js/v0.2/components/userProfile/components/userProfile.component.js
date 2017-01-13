define([
    'angular',
    'components/userProfile/userProfile.module',
    'components/userProfile/controllers/userProfile.controller'
], function (angular) {
    'use strict';

    angular.module('userProfile.module').component('userProfile', {
        bindings: {},
        controller: 'userProfileCtrl',
        controllerAs: 'userProfileCtrl',
        templateUrl: '/static/js/v0.2/components/userProfile/partials/userProfile.template.html'
    });
});
