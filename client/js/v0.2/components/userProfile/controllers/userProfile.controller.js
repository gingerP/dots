define([
    'angular',
    'services/business/game.storage',
    'common/auth-constants',
    'components/userProfile/userProfile.module'
], function (angular, GameStorage, AuthConstants) {
    'use strict';

    angular.module('userProfile.module').controller('userProfileCtrl', UserProfileCtrl);

    function UserProfileCtrl($window) {
        var vm = this;

        function logout() {
            GameStorage.clear();
            $window.open(AuthConstants.LOGOUT, '_self');
        }

        vm.user = GameStorage.getGameClient();

        vm.logout = logout;
    }
});
