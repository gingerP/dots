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

    function CurrentPlayerController($scope) {
        var vm = this,
            observable = Observable.instance;

        vm.isMenuOpened = false;
        vm.isMyselfActive = true;
        vm.isOpponentActive = false;
        vm.myself = gameStorage.getGameClient();
        vm.opponent = gameStorage.getGameOpponent();
        vm.colorOptions = {
          enableEditor: false
        };

        vm.nextPlayer = function nextPlayer() {
            Business.makeNextPlayerActive();
        };

        vm.triggerOpenMenu = function () {
            vm.isMenuOpened = !vm.isMenuOpened;
            observable.emit(Events.MENU_VISIBILITY, vm.isMenuOpened);
        };

/*        backend.emit.getMyself().then(function (client) {
            vm.myself = client;
            $scope.$apply();
        });*/

        observable.on(Events.REFRESH_MYSELF, function() {
            vm.myself = gameStorage.getGameClient();
        });

        observable.on(Events.REFRESH_GAME, function() {
            vm.opponent = gameStorage.getGameOpponent();
        });

        observable.on(Events.CANCEL_GAME, function() {
            delete vm.opponent;
        });

        observable.on(Events.CREATE_GAME, function(message) {
            if (message.to && message.from && message.game) {
                vm.opponent = gameStorage.getOpponent();
                $scope.$apply();
            }
        });

        observable.on(Events.MAKE_PLAYER_ACTIVE, function(playerId) {
            vm.myself = gameStorage.getGameClient();
            vm.opponent = gameStorage.getGameOpponent();

            if (vm.opponent.getId() === playerId) {
                vm.isMyselfActive = false;
                vm.isOpponentActive = true;
            } else if (vm.myself.getId() === playerId) {
                vm.isMyselfActive = true;
                vm.isOpponentActive = false;
            }
            $scope.$apply();
        });
    }
});
