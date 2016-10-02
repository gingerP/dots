define([
    'd3',
    'q',
    'common/events',
    'module.observable',
    'module.backend.service',
    'common/services/game.service',
    'business/module.game.player',
    'business/business.invite',
    'business/game.rules',
    'business/game.storage',
    'common/services/game-data.service',
    'common/services/game.service'
], function (d3, q, Events, Observable, Backend, GameBackend, Player, businessInvite, rules, GameStorage, GameDataService, GameService) {
    'use strict';

    function getId() {
        return id;
    }
    var api;
    var id = Date.now();
    var graphics;
    var gameData;
    var logger;
    var observable = Observable.instance;
    var stepNumber = 0;
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
        return q(function(resolve, reject) {
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
                observable.emit(Events.ADD_DOT, {clientId: activePlayer.getId(), dot: dot});
                activePlayer.history.addDot(dot);
                GameBackend.addDot(dot);
                resolve(function () {
                    //TODO
                    if (isLocalMode()) {
                        api.makeNextPlayerActive();
                    }
                });
            }
        });
    }

    function addActivePlayers() {
        var players_ = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        players_.forEach(function (player) {
            if (players.indexOf(player) < 0) {
                players.push(player);
                player.position = players.indexOf(player);
            }
        });
        observable.emit(api.listen.add_active_player, players_);
        return api;
    }

    function getActivePlayerColor() {
        var player = GameStorage.getActiveGamePlayer();
        return player ? player.getColor() : '';
    }

    function makePlayerActive(player) {
        var activePlayer = GameStorage.getActiveGamePlayer();
        var previousHistoryRecordId = activePlayer? activePlayer.history.getId(): null;
        var players = GameStorage.getGamePlayers();
        if (players.indexOf(player) > -1) {
            activePlayer = player;
            GameStorage.setActiveGamePlayer(activePlayer);
            observable.emit(Events.MAKE_PLAYER_ACTIVE, player.getId());
            activePlayer.history.newRecord(previousHistoryRecordId);
        }
        return api;
    }

    function makeNextPlayerActive() {
        var activePlayer;
        var players;
        if (api.canChangeActivePlayer()) {
            activePlayer = GameStorage.getActiveGamePlayer();
            players = GameStorage.getGamePlayers();
            var index = players.indexOf(activePlayer);
            if (index === players.length - 1) {
                makePlayerActive(players[0]);
            } else {
                makePlayerActive(players[index + 1]);
            }
        }
        return q();
    }

    function getEnemyPlayerDots() {
        var result = [];
        enemyPlayers.forEach(function(player) {
            result = result.concat(player.getDots());
        });
        return result;
    }

    function getEnemyPlayersTrappedDots() {
        var result = [];
        enemyPlayers.forEach(function(player) {
            result = result.concat(player.getTrappedDots());
        });
        return result;
    }

    function updateActivePlayerState(selectedDots, connectedDots) {
        if (selectedDots && selectedDots.length) {
            selectedDots.forEach(function(dot) {
                if (activePlayerState.dots.indexOf(dot) < 0) {
                    activePlayerState.dots.push(dot);
                }
            });
        }
        if (connectedDots && connectedDots.length) {
            connectedDots.forEach(function(dot) {
                if (activePlayerState.connectedDots.indexOf(dot) < 0) {
                    activePlayerState.connectedDots.push(dot);
                }
            });
        }
    }

    function isIdEqualToMyself(myselfId, id) {
        return id === '/#' + myselfId;
    }

    function addClient(pack) {
        if (!isIdEqualToMyself(Backend.getId(), pack.id)) {
            if (!clients.some(function (client) {
                    return client.id === pack.id;
                })) {
                clients.push(pack);
                return true;
            }
        }
        return false;
    }

    function init() {
        reloadGameMode();
        reloadMyself();
        reloadGame();
        observable.on(Events.CREATE_GAME, function(message) {
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
        /*
            dot: dot,
            gameDataList: gameData
         */
        GameService.listen.addDot(function(message) {
            var opponent = GameStorage.getGameOpponent();
            observable.emit(Events.ADD_DOT, {
                dot: message.dot,
                clientId: opponent.getId()
            });
        });
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
            GameDataService.getGameState(game._id).then(function(gameState) {
                var activeGamer = GameStorage.getActiveGamePlayer();
                if (gameState.game && gameState.game.status === 'active') {
                    observable.emit(Events.REFRESH_GAME, gameState);
                    makePlayerActive(activeGamer);
                } else {
                    GameStorage.clearOpponent();
                    observable.emit(Events.CANCEL_GAME);
                }
            });
        }
    }

    //GameStorage.activePlayer = new Player();

    api = {
        init: function (graphics_) {
            graphics = graphics_;
            init();
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,
        select: select,
        addActivePlayers: addActivePlayers,
        getActivePlayerColor: getActivePlayerColor,
        makePlayerActive: makePlayerActive,
        makeNextPlayerActive: makeNextPlayerActive,
        getPlayers: function() {
            return players;
        },
        getActivePlayer: function() {
            return activePlayer;
        },
        addListener: function (property, listener) {
            observable.addListener(property, listener);
            return api;
        },
        getClients: function() {
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