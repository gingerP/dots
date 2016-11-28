define([
    'angular',
    'module.observable',
    'business/module.game.business',
    'common/events',
    'components/utils/scope.utils',
    'utils/game-utils',
    'business/game.storage',
    'business/domains/Constants',
    'components/currentPlayer/currentPlayer.module'
], function (angular, Observable, Business, Events, scopeUtils, gameUtils, GameStorage, Constants) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope) {
        var vm = this,
            observable = Observable.instance;


        function initialize() {
            var activeGamePlayer = GameStorage.getActiveGamePlayer();
            onRefreshMyself();
            onRefreshGame();
            onGameModeChange();
            if (activeGamePlayer) {
                onUpdateActivePlayer(activeGamePlayer.getId());
            }
        }

        function onUpdateActivePlayer(playerId) {
            vm.myself = GameStorage.getGameClient();
            vm.opponent = GameStorage.getGameOpponent();

            if (vm.opponent.getId() === playerId) {
                vm.isMyselfActive = false;
                vm.isOpponentActive = true;
            } else if (vm.myself.getId() === playerId) {
                vm.isMyselfActive = true;
                vm.isOpponentActive = false;
            }
            if (!$rootScope.$$phase) {
                $scope.$apply();
            }
        }

        function onCreateGame(message) {
            if (message.to && message.from && message.game) {
                vm.opponent = GameStorage.getGameOpponent();
                $scope.$apply();
            }
        }

        function onRefreshMyself() {
            vm.myself = GameStorage.getGameClient();
        }

        function onRefreshGame() {
            vm.opponent = GameStorage.getGameOpponent();
        }

        function onGameModeChange() {
            vm.gameMode = GameStorage.getGameMode();
        }

        vm.GAME_MODE = Constants.GAME_MODE;
        vm.isMenuOpened = false;
        vm.isMyselfActive = true;
        vm.isOpponentActive = false;
        vm.myself = GameStorage.getGameClient();
        vm.opponent = GameStorage.getGameOpponent();
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

        observable.on(Events.CANCEL_GAME, function () {
            delete vm.opponent;
        });

        observable.on(Events.CREATE_GAME, onCreateGame);
        observable.on(Events.REFRESH_MYSELF, onRefreshMyself);
        observable.on(Events.REFRESH_GAME, onRefreshGame);
        observable.on(Events.MAKE_PLAYER_ACTIVE, onUpdateActivePlayer);
        observable.on(Events.GAME_MODE, onGameModeChange);

        initialize();
    }
});
