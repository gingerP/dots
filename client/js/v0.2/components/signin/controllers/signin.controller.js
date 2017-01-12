define([
    'angular',
    'business/game.storage',
    'components/signin/signin.module',
    'components/signin/factories/signinConfig.factory'
], function (angular, GameStorage) {
    'use strict';

    angular.module('signin.module').controller('signinCtrl', SigninCtrl);

    function SigninCtrl($window, $q, signinConfig) {
        var vm = this,
            URL = signinConfig.URL;

        function canAuth() {
            return vm.isAuthenticated;
        }

        function loginGoogle() {
            if (canAuth()) {
                $window.open(URL.AUTH.GOOGLE, '_self');
            }
        }

        vm.loginGoogle = loginGoogle;
        vm.myself = GameStorage.getGameClient();
        vm.isAuthenticated = Boolean(vm.myself.auth);
    }
});
