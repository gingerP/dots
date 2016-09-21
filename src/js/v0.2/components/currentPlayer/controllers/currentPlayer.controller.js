define([
    'angular',
    'module.observable',
    'module.game.business',
    'module.backend.service',
    'common/events',
    'components/utils/scope.utils',
    'utils/game-utils',
    'business/game.storage',
    'components/currentPlayer/currentPlayer.module'
], function (angular, Observable, Business, backend, Events, scopeUtils, gameUtils, gameStorage) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope) {
        var vm = this,
            scope = $scope,
            observable = Observable.instance;

        function updateActiveState() {
            vm.isMyselfActive = !vm.isMyselfActive;
            vm.isOpponentActive = !vm.isOpponentActive;
            $scope.$apply();
        }

        vm.opponent = gameStorage.getOpponent();
        vm.isMenuOpened = false;
        vm.isMyselfActive = false;
        vm.isOpponentActive = false;

        vm.nextPlayer = function nextPlayer() {
            Business.makeNextPlayerActive.bind(Business);
        };

        vm.triggerOpenMenu = function () {
            vm.isMenuOpened = !vm.isMenuOpened;
            observable.emit(Events.MENU_VISIBILITY, vm.isMenuOpened);
        };

        backend.emit.getMyself().then(function (client) {
            vm.myself = client;
            $scope.$apply();
        });

        observable.on(Events.CANCEL_GAME, function(message) {
            delete vm.opponent;
        });

        observable.on(Events.CREATE_GAME, function(message) {
            var myself;
            var opponent;
            if (message.to && message.from && message.game) {
                myself = gameStorage.getClient();
                vm.opponent = myself._id === message.to._id ? message.from : message.to;
                $scope.$apply();
            }
        });

        observable.on(Events.MAKE_PLAYER_ACTIVE, function(player) {
            if (vm.opponent === player) {
                vm.isMyselfActive = false;
                vm.isOpponentActive = true;
            } else if (gameStorage.getClient() === player) {
                vm.isMyselfActive = true;
                vm.isOpponentActive = false;
            }
        });
    }
});
