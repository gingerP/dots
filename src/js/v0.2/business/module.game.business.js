define([
    'lodash',
    'q',
    'common/events',
    'module.observable',
    'business/module.game.player',
    'business/business.invite',
    'business/game.rules',
    'business/game.storage',
    'common/services/game-data.service',
    'common/services/game.service',
    'module.game.graphics'
], function (_, q, Events, Observable, Player, businessInvite, rules, GameStorage, GameDataService,
             GameService, Graphics) {
    'use strict';

    var api;
    var observable = Observable.instance;
    var GAME_MODE = {
        LOCAL: 'LOCAL',
        NETWORK: 'NETWORK'
    };

    function canSelectDot(data) {
        return rules.rulesCanSelect.every(function (rule) {
            return rule(data);
        });
    }

    function canConnectDots(data1, data2) {
        return rules.rulesCanConnect.every(function (rule) {
            return rule(data1, data2);
        });
    }

    function canChangeActivePlayer() {
        return q(function (resolve, reject) {
            var canChange = rules.rulesCanChangeActivePlayer.every(function (rule) {
                return rule();
            });
            canChange ? resolve() : reject();
        });
    }

    //------------------------------------------------

    function isLocalMode() {
        return GameStorage.getGameMode() === GAME_MODE.LOCAL;
    }

    function isNetworkMode() {
        return GameStorage.getGameMode() === GAME_MODE.NETWORK;
    }

    function select(dot) {
        return new Promise(function (resolve, reject) {
            var activePlayer = GameStorage.getActiveGamePlayer();
            if (!canSelectDot(dot)) {
                reject();
            } else {
                activePlayer.addDot(dot);
                observable.emit(Events.ADD_DOT, {gamePlayerId: activePlayer.getId(), dot: dot});
                GameService.addDot(dot);
                Graphics.renderPlayerState(activePlayer, dot);
            }
        });
    }

    function makePlayerActive(player) {
        var activePlayer = GameStorage.getActiveGamePlayer();
        var players = GameStorage.getGamePlayers();
        if (players.indexOf(player) > -1) {
            activePlayer = player;
            GameStorage.setActiveGamePlayer(activePlayer);
            observable.emit(Events.MAKE_PLAYER_ACTIVE, player.getId());
        }
        return api;
    }

    function makeNextPlayerActive() {
        var activePlayer;
        var players;
        var index;
        if (api.canChangeActivePlayer()) {
            activePlayer = GameStorage.getActiveGamePlayer();
            players = GameStorage.getGamePlayers();
            index = players.indexOf(activePlayer);
            if (index === players.length - 1) {
                makePlayerActive(players[0]);
            } else {
                makePlayerActive(players[index + 1]);
            }
        }
        return q();
    }

    function reloadGameMode() {
        GameStorage.setGameMode(GAME_MODE.NETWORK);
    }

    function reloadMyself() {
        observable.emit(Events.REFRESH_MYSELF);
    }

    function reloadGame() {
        var game = GameStorage.getGame();
        if (game) {
            GameDataService.getGameState(game._id).then(function (gameState) {
                var activeGamer;
                if (gameState.game && gameState.game.activePlayer) {
                    activeGamer = GameStorage.getGamePlayerById(gameState.game.activePlayer);
                    makePlayerActive(activeGamer);
                }
                if (gameState.game && gameState.game.status === 'active') {
                    refreshGame(gameState);
                } else {
                    cancelGame();
                }
            });
        }
    }

    function refreshGame(gameState) {
        var activeGamer = GameStorage.getActiveGamePlayer();
        observable.emit(Events.REFRESH_GAME, gameState);
        makePlayerActive(activeGamer);
        _.forEach(gameState.gameData, function(score) {
            var client = _.find(gameState.clients, {_id: score.client});
            if (score.dots.length) {
                Graphics.renderPlayerState(client, score.dots);
            }
        });
    }

    function cancelGame() {
        GameStorage.clearOpponent();
        Graphics.clearPane();
        observable.emit(Events.CANCEL_GAME);
    }

    function init() {
        reloadGameMode();
        reloadMyself();
        reloadGame();

        observable.on(Events.CREATE_GAME, function (message) {
            var beginner = message.from;
            var beginnerGamer;
            var myself = GameStorage.getGameClient();
            var opponent = GameStorage.getGameOpponent();
            if (myself.getId() === beginner._id) {
                beginnerGamer = myself;
            } else if (opponent.getId() === beginner._id) {
                beginnerGamer = opponent;
            }
            if (beginnerGamer) {
                makePlayerActive(beginnerGamer);
            }
        });

        GameService.listen.gameStep(function (message) {
            var gamePlayer = GameStorage.getGamePlayerById(message.currentPlayerId);
            var previousGamePlayer = GameStorage.getGamePlayerById(message.previousPlayerId);
            GameStorage.setGame(message.game);
            makePlayerActive(gamePlayer);
            Graphics.renderPlayerState(previousGamePlayer, message.dot);
            observable.emit(Events.GAME_STEP, {
                dot: message.dot,
                previousGamePlayerId: message.previousPlayerId
            });
        });
    }

    api = {
        init: function () {
            init();
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,
        select: select,
        makePlayerActive: makePlayerActive,
        makeNextPlayerActive: makeNextPlayerActive,
        getPlayers: function () {
            return players;
        },
        getActivePlayer: function () {
            return activePlayer;
        },
        addListener: function (property, listener) {
            observable.addListener(property, listener);
            return api;
        },
        getClients: function () {
            return clients;
        },
        invite: businessInvite,
        listen: {
            invite_player: 'invite_player',
            add_active_player: 'add_active_player',
            change_active_player: 'change_active_player',
            add_client: 'add_client',
            add_dot: 'add_dot',
            conquer_dots: 'conquer_dots'
        }
    };
    /*ModuleGraph.sb(api);*/
    return api;
});