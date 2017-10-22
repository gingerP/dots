define([
    'lodash',
    'q',
    'common/events',
    'services/business/domains/NetworkStatus',
    'module.observable',
    'services/business/game.rules',
    'common/common-constants',
    'utils/game-utils',
    'utils/player-utils',
    'utils/converters-utils',
    'services/business/game.storage',
    'services/backend/game-data.service',
    'servives/backend/gameCancel.service',
    'services/backend/game.service',
    'services/backend/invite.service',
    'services/backend/gameSupport.service',
    'graphics/module.game.graphics'
], function (_, q, Events, NetworkStatus, Observable, rules, CommonConstants,
             GameUtils, PlayerUtils, ConvertersUtils, GameStorage,
             GameDataService, GameCancelService, GameService, InviteService, GameSupportService,
             Graphics) {
    'use strict';

    var api;
    var observable = Observable.instance;
    var GAME_MODE = CommonConstants.GAME_MODE;

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
            if (!canSelectDot(dot)) {
                reject();
            } else {
                GameService.addDot(dot)
                    .then(resolve)
                    .catch(reject);
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

    function addListener(property, listener) {
        observable.addListener(property, listener);
        return api;
    }

    function reloadGameMode() {
        GameStorage.setGameMode(GAME_MODE.NETWORK);
        observable.emit(Events.GAME_MODE, GAME_MODE.NETWORK);
    }

    function reloadMyself() {
        observable.emit(Events.REFRESH_MYSELF);
    }

    /**
     *
     * @param {Game} game game instance
     * @param {GameStateUser[]} users game clients
     * @returns {undefined}
     */
    function refreshGame(game, users) {
        var activeGamer = GameStorage.getGamePlayerById(game.activePlayer);
        var opponent = GameStorage.getGameOpponent();
        makePlayerActive(activeGamer);
        PlayerUtils.updatePlayersColorsFromGameData.apply(PlayerUtils, _.map(users, 'gameData'));
        observable.emit(Events.REFRESH_GAME);
        _.forEach(users, function (user) {
            var gameData = user.gameData;
            var gamePlayer = GameStorage.getGamePlayerById(user._id);
            var dots = (gameData.dots || []).concat(gameData.losingDots || []);
            var isOpponent = opponent.getId() === user._id;
            if (gameData.dots.length) {
                GameUtils.updatePlayerState(
                    user._id, gameData.dots, gameData.loops, user.capturedDots, gameData.losingDots
                );
                Graphics.updatePlayerState(
                    gamePlayer.color, dots, gameData.loops, user.capturedDots, gameData.losingDots, isOpponent
                );
            }
        });
    }

    function cancelGame(forceServiceRequest) {
        var game = GameStorage.getGame();
        var opponent = GameStorage.getOpponent();
        GameStorage.clearGame();
        PlayerUtils.cancelGame();
        Graphics.clearPane();
        observable.emit(Events.CANCEL_GAME, {
            opponent: opponent,
            game: game
        });
        if (forceServiceRequest && game && opponent) {
            InviteService.cancelGame(game._id);
        }
    }

    function reloadGame() {
        var game = GameStorage.getGame();
        if (game) {
            GameDataService.getGameState(game._id)
                .then(
                    /**
                     * @typedef {{
                     *              _id: MongoId,
                     *              created: date,
                     *              updated: date,
                     *              isOnline: boolean,
                     *              name: string
                     *              gameData: GameData,
                     *              capturedDots: Dot[]
                     *          }} GameStateUser
                     * @param {{game: Game, clients: GameStateUser[]}} gameState game state response
                     */
                    function (gameState) {
                        if (gameState.game && gameState.game.status === 'active') {
                            refreshGame(gameState.game, gameState.clients);
                        } else {
                            cancelGame();
                        }
                    })
                .catch(function () {
                    cancelGame();
                });
        } else {
            cancelGame();
        }
    }

    function checkAndNotifyAboutOpponentNetworkStatus(disconnected, reconnected) {
        var opponent = GameStorage.getOpponent();
        if (opponent) {
            if (disconnected.length && disconnected.indexOf(opponent._id) > -1) {
                opponent.isOnline = false;
                GameStorage.setOpponent(opponent);
                observable.emit(Events.OPPONENT_OFFLINE);
            } else if (reconnected.length && _.findIndex(reconnected, {_id: opponent._id}) > -1) {
                opponent.isOnline = true;
                GameStorage.setOpponent(opponent);
                observable.emit(Events.OPPONENT_ONLINE);
            }
        }
    }

    function updatePlayer(playerData, color) {
        var delta = playerData.delta;
        GameUtils.updatePlayerState(
            playerData.gamerId,
            delta.dots,
            delta.loops,
            delta.capturedDots,
            delta.losingDots
        );
        Graphics.updatePlayerState(
            color,
            delta.dots,
            delta.loops,
            delta.capturedDots,
            delta.losingDots,
            false
        );
    }

    function gameGaveUp() {
        var deferred = q.defer();
        var game = GameStorage.getGame();
        if (game) {
            GameCancelService.gaveUp()
                .then(function (result) {
                    deferred[result ? 'resolve' : 'reject']();
                })
                .catch(function () {
                    deferred.reject();
                });
        }
        return deferred.promise;
    }

    function gameOfferDraw() {
        var deferred = q.defer();
        var game = GameStorage.getGame();
        if (game) {
            GameCancelService.offerDraw()
                .then(function (result) {
                    deferred[result ? 'resolve' : 'reject']();
                })
                .catch(function () {
                    deferred.reject();
                });
        }
        return deferred.promise;
    }

    function gameOfferComplete() {
        var deferred = q.defer();
        var game = GameStorage.getGame();
        if (game) {
            GameCancelService.offerToComplete()
                .then(function (result) {
                    deferred[result ? 'resolve' : 'reject']();
                })
                .catch(function () {
                    deferred.reject();
                });
        }
        return deferred.promise;
    }

    function listenNextStep() {
        GameService.listen.gameStep(
            /**
             * @param {{
             *  dot: Dot,
             *  previous: {
             *      gamerId: MongoId,
             *      gameData: GameData,
             *      delta: GameDataDelta
             *  },
             *  current: {
             *      gamerId: MongoId,
             *      gameDate: GameData,
             *      delta: GameDataDelta
             *  },
             *  game: Game
             * }} message server response for new dot
             * @returns {undefined}
             */
            function (message) {
                var currentPlayer = GameStorage.getGamePlayerById(message.current.gamerId);
                var previousPlayer = GameStorage.getGamePlayerById(message.previous.gamerId);

                GameStorage.setGame(message.game);
                makePlayerActive(currentPlayer);

                updatePlayer(message.current, currentPlayer.color);
                updatePlayer(message.previous, previousPlayer.color);

                observable.emit(Events.GAME_STEP, {
                    dot: message.dot,
                    previousGamePlayerId: message.previous.gamerId
                });
            }
        );
    }

    function listenGameCancel() {
        InviteService.listen.cancel(function (message) {
            var currentGame;
            Graphics.clearAnimation();
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
    }

    function listenNetworkStatus() {
        GameSupportService.listen.networkStatusChange(function (message) {
            checkAndNotifyAboutOpponentNetworkStatus(message.disconnected, message.reconnected);
            if (message.disconnected.length) {
                observable.emit(Events.CLIENTS_DISCONNECT, message.disconnected);
            }
            if (message.reconnected.length) {
                observable.emit(Events.CLIENTS_RECONNECT, message.reconnected);
            }
        });

    }

    function init() {
        reloadGameMode();
        reloadMyself();
        reloadGame();

        listenNextStep();
        listenGameCancel();
        listenNetworkStatus();
        return api;
    }

    api = {
        init: init,
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,
        select: select,
        makePlayerActive: makePlayerActive,
        makeNextPlayerActive: makeNextPlayerActive,
        addListener: addListener,
        cancelGame: function () {
            cancelGame(true);
        },
        gameGaveUp: gameGaveUp,
        gameOfferDraw: gameOfferDraw,
        gameOfferComplete: gameOfferComplete
    };
    return api;
});
