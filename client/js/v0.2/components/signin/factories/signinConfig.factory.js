define([
    'angular',
    'components/signin/signin.module'
], function (angular) {
    'use strict';

    angular.module('signin.module').factory('signinConfig', signinConfig);

    function signinConfig() {
        return {
            URL: {
                AUTH: {
                    GOOGLE: '/auth/google'
                }
            }
        };
    }
});
