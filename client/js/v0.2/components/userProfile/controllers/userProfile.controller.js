define([
    'angular',
    'services/business/game.storage',
    'utils/constants',
    'components/userProfile/userProfile.module'
], function (angular, GameStorage, Constants) {
    'use strict';

    angular.module('userProfile.module').controller('userProfileCtrl', UserProfileCtrl);

    function UserProfileCtrl($window) {
        var vm = this,
            Auth = Constants.AUTH;

        function logout() {
            GameStorage.clear();
            $window.open(Auth.LOGOUT, '_self');
        }

        vm.user = GameStorage.getGameClient();

        vm.logout = logout;
    }
});
