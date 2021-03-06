define([
    'angular',
    'module.observable',
    'business/module.game.business',
    'common/common-constants',
    'common/events',
    'business/game.storage',
    'business/domains/Constants',
    'components/currentPlayer/currentPlayer.module',
    'components/utils/scope.utils'
], function (angular, Observable, Business,
             CommonConstants, Events,
             GameStorage) {
    'use strict';

    angular.module('currentPlayer.module').controller('currentPlayerCtrl', CurrentPlayerController);

    function CurrentPlayerController($scope, $rootScope, scopeUtils) {
        var vm = this,
            observable = Observable.instance,
            PLAYER_STYLE_PREFIX = 'player-style-',
            apply = scopeUtils.getApply($scope),
            TABS = CommonConstants.TABS;


        function initialize() {
            var activeGamePlayer = GameStorage.getActiveGamePlayer();
            onRefreshMyself();
            onRefreshGame();
            onGameModeChange();
            if (activeGamePlayer) {
                onUpdateActivePlayer(activeGamePlayer.getId());
            }
        }

        function updatePlayersStyles() {
            var active = GameStorage.getActiveGamePlayer();
            if (GameStorage.hasOpponent()) {
                vm.style.myself = PLAYER_STYLE_PREFIX + vm.myself.color;
                vm.style.opponent = PLAYER_STYLE_PREFIX + vm.opponent.color;
                vm.style.active = null;
                if (active) {
                    vm.style.active = PLAYER_STYLE_PREFIX + active.color;
                }
            } else {
                vm.style = {};
            }
            apply();
        }

        function openMyself() {
            triggerOpenMenu();
            $rootScope.$emit(Events.OPEN_TAB, TABS.SIGNIN);
        }

        function onUpdateActivePlayer(playerId) {
            vm.myself = GameStorage.getGameClient();
            vm.opponent = GameStorage.getGameOpponent();

            if (vm.opponent.getId() === playerId) {
                vm.isMyselfActive = false;
                vm.isOpponentActive = true;
                vm.style.active = PLAYER_STYLE_PREFIX + vm.opponent.color;
            } else if (vm.myself.getId() === playerId) {
                vm.isMyselfActive = true;
                vm.isOpponentActive = false;
                vm.style.active = PLAYER_STYLE_PREFIX + vm.myself.color;
            }
            apply();
        }

        function onCreateGame(message) {
            if (message.to && message.from && message.game) {
                vm.opponent = GameStorage.getGameOpponent();
                updatePlayersStyles();
                apply();
            }
        }

        function onRefreshMyself() {
            vm.myself = GameStorage.getGameClient();
        }

        function onRefreshGame() {
            vm.opponent = GameStorage.getGameOpponent();
            updatePlayersStyles();
        }

        function onGameModeChange() {
            vm.gameMode = GameStorage.getGameMode();
        }

        function onCancelGame() {
            delete vm.opponent;
            updatePlayersStyles();
        }

        function onGameStepChange() {
            vm.myself = GameStorage.getGameClient();
            vm.opponent = GameStorage.getGameOpponent();
            apply();
        }

        function nextPlayer() {
            Business.makeNextPlayerActive();
        }

        function triggerOpenMenu() {
            vm.isMenuOpened = !vm.isMenuOpened;
            observable.emit(Events.MENU_VISIBILITY, vm.isMenuOpened);
        }

        vm.GAME_MODE = CommonConstants.GAME_MODE;
        vm.isMenuOpened = false;
        vm.isMyselfActive = true;
        vm.isOpponentActive = false;
        vm.myself = GameStorage.getGameClient();
        vm.opponent = GameStorage.getGameOpponent();
        vm.style = {
            myself: null,
            opponent: null,
            active: null
        };


        vm.openMyself = openMyself;
        vm.nextPlayer = nextPlayer;
        vm.triggerOpenMenu = triggerOpenMenu;

        observable.on(Events.CANCEL_GAME, onCancelGame);
        observable.on(Events.CREATE_GAME, onCreateGame);
        observable.on(Events.REFRESH_MYSELF, onRefreshMyself);
        observable.on(Events.REFRESH_GAME, onRefreshGame);
        observable.on(Events.MAKE_PLAYER_ACTIVE, onUpdateActivePlayer);
        observable.on(Events.GAME_MODE, onGameModeChange);
        observable.on(Events.GAME_STEP, onGameStepChange);

        initialize();
    }
});
