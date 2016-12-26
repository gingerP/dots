define([
    'angular',
    'components/signin/signin.module',
    'components/signin/factories/signinConfig.factory'
], function (angular) {
    'use strict';

    angular.module('signin.module').controller('signinCtrl', SigninCtrl);

    function SigninCtrl($http, signinConfig) {
        var vm = this,
            URL = signinConfig.URL;

        function loginGoogle() {
            $http({
                method: 'GET',
                url: URL.AUTH.GOOGLE
            }).then(function () {

            }, function () {

            });
        }

        vm.loginGoogle = loginGoogle;
    }
});
