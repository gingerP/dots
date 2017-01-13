define([
    'angular',
    'components/signin/signin.module',
    'components/userProfile/components/userProfile.component',
    'components/signin/controllers/signin.controller'
], function (angular) {
    'use strict';

    angular.module('signin.module').component('signIn', {
        bindings: {},
        controller: 'signinCtrl',
        controllerAs: 'signinCtrl',
        templateUrl: '/static/js/v0.2/components/signin/partials/signin.template.html'
    });
});
