define([
    'lodash',
    'q',
    'common/events',
    'module.observable',
    'business/business.invite',
    'business/game.rules',
    'utils/game-utils',
    'business/game.storage',
    'common/services/game-data.service',
    'common/services/game.service',
    'common/services/invite.service',
    'module.game.graphics'
], function (_, q, Events, Observable, businessInvite, rules,
             GameUtils, GameStorage,
             GameDataService, GameService, InviteService,
             Graphics) {
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
            if (canChange) {
                resolve();
            } else {
                reject();
            }
        });
    }

    //------------------------------------------------

    function select(dot) {
        return new Promise(function (resolve, reject) {
            var activePlayer = GameStorage.getActiveGamePlayer();
            if (!canSelectDot(dot)) {
                reject();
            } else {
                activePlayer.selectDot(dot);
                observable.emit(Events.ADD_DOT, {gamePlayerId: activePlayer.getId(), dot: dot});
                GameService.addDot(dot);
                Graphics.updatePlayerState(activePlayer, dot);
            }
        });
    }

    function makePlayerActive(player) {
        var players = GameStorage.getGamePlayers();
        if (players.indexOf(player) > -1) {
            player.newStep();
            GameStorage.setActiveGamePlayer(player);
            observable.emit(Events.MAKE_PLAYER_ACTIVE, player.getId());
            console.info(player.getId());
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
                if (gameState.game && gameState.game.status === 'active') {
                    refreshGame(gameState);
                } else {
                    cancelGame();
                }
            });
        } else {
            cancelGame();
        }
    }

    function refreshGame(gameState) {
        var activeGamer = GameStorage.getGamePlayerById(gameState.game.activePlayer);
        console.info(activeGamer.getId());
        makePlayerActive(activeGamer);
        observable.emit(Events.REFRESH_GAME, gameState);
        _.forEach(gameState.gameData, function (score) {
            var client = _.find(gameState.clients, {_id: score.client});
            var dots = (score.dots || []).concat(score.losingDots || []);
            if (score.dots.length) {
                GameUtils.updatePlayerState(client._id, score);
                Graphics.updatePlayerState(client, dots, score.loops);
            }
        });
    }

    function cancelGame(forceServiceRequest) {
        var game = GameStorage.getGame();
        var opponent = GameStorage.getOpponent();
        GameStorage.clearGame();
        Graphics.clearPane();
        observable.emit(Events.CANCEL_GAME);
        if (forceServiceRequest && game && opponent) {
            InviteService.cancelGame(game._id);
        }
    }

    function init() {
        reloadGameMode();
        reloadMyself();
        reloadGame();

        InviteService.listen.cancel(function (message) {
            var currentGame;
            if (GameStorage.hasOpponent()) {
                currentGame = GameStorage.getGame();
                if (currentGame._id && currentGame._id === message.game._id) {
                    if (!message.game && message.game._id) {
                        console.warn('Game does not found!');
                    }
                    cancelGame();
                }
            }
        });

        GameService.listen.gameStep(function (message) {
            var gamePlayer = GameStorage.getGamePlayerById(message.currentPlayerId);
            var previousGamePlayer = GameStorage.getGamePlayerById(message.previousPlayerId);
            GameStorage.setGame(message.game);
            makePlayerActive(gamePlayer);
            Graphics.updatePlayerState(previousGamePlayer, message.dot, message.previousPlayerGameData.loops);
            observable.emit(Events.GAME_STEP, {
                dot: message.dot,
                previousGamePlayerId: message.previousPlayerId
            });
        });

        GameDataService.listen.newClient(function (message) {
            observable.emit(Events.NEW_CLIENT, message);
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
        addListener: function (property, listener) {
            observable.addListener(property, listener);
            return api;
        },
        invite: businessInvite,
        listen: {
            invite_player: 'invite_player',
            add_active_player: 'add_active_player',
            change_active_player: 'change_active_player',
            add_client: 'add_client',
            add_dot: 'add_dot',
            conquer_dots: 'conquer_dots'
        },
        cancelGame: function () {
            cancelGame(true);
        }
    };
    return api;
});