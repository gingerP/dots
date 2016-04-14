define([
    'd3',
    'observable',
    'module.graph'
], function (d3, Observable, ModuleGraph) {
    'use strict';

    function getId() {
        return id;
    }
    var api;
    var id = Date.now();
    var graphics;
    var gameData;
    var gameDataMatrix;
    var players = [];
    var enemyPlayers;
    var activePlayer;
    var activePlayerState = {};
    var observable = new Observable();
    var mode;
    var modes = {
        local: 'local',
        network: 'network'
    };
    /**
     * args - data
     * @type {Array}
     */
    var rulesCanSelect = [
        isDotFree,
        function() {
            return !isActivePlayerSelectDot.apply(null, arguments);
        }
    ];
    /**
     * args - data1, data2
     * @type {Array}
     */
    var rulesCanConnect = [
        isDotsNeighbors,
        isDotsSelected,
        isDotsBelongsToOnePlayer,
        isDotsBelongsToActivePlayer
    ];

    var rulesCanChangeActivePlayer = [
        isActivePlayerSelectDot,
        isActivePlayerLeadRoundTrappedDots
    ];

    /**
     * line = {start, finish, id}
     */

    function canSelectDot(data) {
        return rulesCanSelect.every(function (rule) {
            return rule(data);
        });
    }

    function canConnectDots(data1, data2) {
        return rulesCanConnect.every(function (rule) {
            return rule(data1, data2);
        });
    }

    function canChangeActivePlayer() {
        return rulesCanChangeActivePlayer.every(function (rule) {
            return rule();
        });
    }

    //RULES-------------------------------------------

    function isDotFree(data) {
        return !hasPlayersDots(data.id);
    }

    function isDotsNeighbors(data1, data2) {
        return Math.abs(data1.xInd - data2.xInd) <= 1
            && Math.abs(data1.yInd - data2.yInd) <= 1;
    }

    function isDotsSelected(data1, data2) {
        return hasPlayersDots(data1, data2);
    }

    function isDotsBelongsToOnePlayer(data1, data2) {
        return players.some(function (player) {
            return player.hasDot(data1) && player.hasDot(data2);
        });
    }

    function isDotsBelongsToActivePlayer(data1, data2) {
        return activePlayer.hasDot(data1) && activePlayer.hasDot(data2);
    }

    function isActivePlayerSelectDot() {
        return activePlayer.history.hasDots();
    }

    function isActivePlayerLeadRoundTrappedDots() {
        return true;
    }

    //------------------------------------------------

    function isLocalMode() {
        return mode === modes.local;
    }

    function isNetworkMode() {
        return mode === modes.network;
    }

    function select(data) {
        return new Promise(function (resolve, reject) {
            var loops;
            if (!canSelectDot(data)) {
                reject();
            } else {
                activePlayer.addDot(data);
                updateActivePlayerState([data]);
                observable.propertyChange(api.listen.add_dot, data);
                activePlayer.history.addDot(data);
                loops = ModuleGraph.getLoops(convertDataArrayForGraphModule(activePlayer.getDots()));
                if (loops.length) {
                    loops.forEach(function(loop) {
                        graphics.renderWall(loop);
                    });
                }
                resolve(function () {
                    //TODO
                    //if (!isLocalMode() && false) {
                        api.makeNextPlayerActive();
                    //}
                });
            }
        })
    }

    function addPlayers() {
        var players_ = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        players_.forEach(function (player) {
            if (players.indexOf(player) < 0) {
                players.push(player);
            }
        });
        observable.propertyChange(api.listen.add_player, players_);
        return api;
    }

    function hasPlayersDots() {
        var ids = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        return players.some(function (player) {
            return ids.every(function (id) {
                return player.hasDot(id);
            });
        })
    }

    function getActivePlayerColor() {
        return activePlayer ? activePlayer.getColor() : '';
    }

    function makePlayerActive(player) {
        var previousHistoryRecordId = activePlayer? activePlayer.history.getId(): null;
        if (players.indexOf(player) > -1) {
            activePlayer = player;
            makePlayersEnemyExept(activePlayer);
            clearActivePlayerState();
            observable.propertyChange(api.listen.change_active_player, player);
            activePlayer.history.newRecord(previousHistoryRecordId);
        }
        return api;
    }

    function makeNextPlayerActive() {
        if (api.canChangeActivePlayer()) {
            var index = players.indexOf(activePlayer);
            if (index === players.length - 1) {
                makePlayerActive(players[0]);
            } else {
                makePlayerActive(players[index + 1]);
            }
        }
        return api;
    }

    function makePlayersEnemyExept(activePlayer) {
        enemyPlayers = [];
        players.forEach(function(player) {
            if (player != activePlayer) {
                enemyPlayers.push(player);
            }
        });
    }

    function getEnemyPlayerDots() {
        var result = [];
        enemyPlayers.forEach(function(player) {
            result = result.concat(player.getDots());
        });
        return result;
    }

    function clearActivePlayerState() {
        activePlayerState = {};
        activePlayerState.dots = [];
        activePlayerState.connectedDots = [];
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

    function convertDataArrayForGraphModule(data) {
        return data.map(convertDataForGraphModule);
    }

    function convertDataForGraphModule(data) {
        return {
            x: data.xInd,
            y: data.yInd
        }
    }

    api = {
        init: function (mode_, graphics_, data_, gameDataMatrix_) {
            mode = mode_;
            graphics = graphics_;
            gameData = data_;
            gameDataMatrix = gameDataMatrix_;
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,

        select: select,
        addPlayers: addPlayers,
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
        listen: {
            change_active_player: 'change_active_player',
            add_player: 'add_player',
            add_dot: 'add_dot'
        },
        modes: modes
    };
    ModuleGraph.sb(api);
    return api;
});