define([
    'angular',
    'module.observable',
    'module.game.business',
    'module.backend.service',
    'components/constants/events.constant',
    'components/utils/scope.utils',
    'utils/game-utils',
    'business/game.storage',
    'components/currentPlayer/currentPlayer.module'
], function (angular, Observable, Business, backend, events, scopeUtils, gameUtils, gameStorage) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope) {
        var vm = this,
            scope = $scope,
            observable = Observable.instance;

        vm.myself;
        vm.opponent = gameStorage.getOpponent();
        vm.isMenuOpened = false;
        vm.isMyselfActive = true;
        vm.isOpponentActive = false;

        vm.nextPlayer = function nextPlayer() {
            Business.
            vm.isMyselfActive = !vm.isMyselfActive;
            vm.isOpponentActive = !vm.isOpponentActive;
        };

        vm.triggerOpenMenu = function () {
            vm.isMenuOpened = !vm.isMenuOpened;
            observable.emit(events.MENU_VISIBILITY, vm.isMenuOpened);
        };

        backend.emit.getMyself().then(function (client) {
            vm.myself = client;
            $scope.$apply();
        });

        $scope.$on('$destroy', observable.on(events.CANCEL_GAME, function(message) {
            delete vm.opponent;
        }));

        $scope.$on('$destroy', observable.on(events.CREATE_GAME, function(message) {
            var myself;
            var opponent;
            if (message.to && message.from && message.game) {
                myself = gameStorage.getClient();
                vm.opponent = myself._id === message.to._id ? message.from : message.to;
                $scope.$apply();
            }
        }));
    }
});
