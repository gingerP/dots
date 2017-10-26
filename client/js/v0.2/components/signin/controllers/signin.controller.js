define([
    'angular',
    'module.observable',
    'common/events',
    'services/business/game.storage',
    'utils/constants',
    'components/signin/signin.module',
    'components/utils/scope.utils'
], function (angular, Observable, Events, GameStorage, Constants) {
    'use strict';

    angular.module('signin.module').controller('signinCtrl', SigninCtrl);

    function SigninCtrl($scope, $window, scopeUtils) {
        var vm = this,
            observable = Observable.instance,
            apply = scopeUtils.getApply($scope),
            Auth = Constants.AUTH;

        function canAuth() {
            return !vm.isAuthenticated;
        }

        function getLoginFn(url) {
            return function login() {
                if (canAuth()) {
                    $window.open(url, '_self');
                }
            };
        }

        function onRefreshMyself() {
            init();
            apply();
        }

        function init() {
            vm.myself = GameStorage.getGameClient();
            vm.isAuthenticated = Boolean(vm.myself ? vm.myself.auth : false);
        }

        vm.loginGoogle = getLoginFn(Auth.SOCIAL.GOOGLE);
        vm.loginVk = getLoginFn(Auth.SOCIAL.VK);
        vm.loginFacebook = getLoginFn(Auth.SOCIAL.FACEBOOK);
        observable.on(Events.REFRESH_MYSELF, onRefreshMyself);

        vm.$onInit = init;
    }
});
