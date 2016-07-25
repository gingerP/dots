define([
    'd3',
    'observable',
    'module.graph',
    'module.backend.service'
], function (d3, Observable, ModuleGraph, Backend) {
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
    var clients = [];
    var enemyPlayers;
    var activePlayer;
    var activePlayerState = {};
    var observable = new Observable();
    var mode;
    var logger;
    var stepNumber = 0;
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
    var loopCheckers = [
        ModuleGraph.checkers.isCorrectNumbersOfVertexes,
        function isLoopNotSurroundsVertexes(loop) {
            var enemyPlayersTrappedDots = getEnemyPlayersTrappedDots();
            if (enemyPlayersTrappedDots.length) {
                return !ModuleGraph.checkers.isLoopSurroundsVertexes(
                    loop,
                    convertDataArrayForGraphModule(enemyPlayersTrappedDots)
                );
            }
            return true;
        },
        ModuleGraph.checkers.isLoopSurroundsVertexes,
        ModuleGraph.checkers.isStartAndFinishNeighbor
    ];

    var transportUtils = {
        addDot: function(dot) {
            Transport.sendData({
                type: Transport.listen.add_dot,
                content: dot
            })
        },
        invitePlayer: function(player) {
            return Transport.sendData({
                type: Transport.listen.invite_player,
                content: player
            })
        }
    };

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
            if (!canSelectDot(data)) {
                reject();
            } else {
                activePlayer.addDot(data);
                updateActivePlayerState([data]);
                observable.propertyChange(api.listen.add_dot, data);
                activePlayer.history.addDot(data);
                transportUtils.addDot(data);
                updateCapturedState();
                resolve(function () {
                    //TODO
                    if (!isLocalMode()) {
                        api.makeNextPlayerActive();
                    }
                });
            }
        })
    }

    function addActivePlayers() {
        var players_ = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        players_.forEach(function (player) {
            if (players.indexOf(player) < 0) {
                players.push(player);
                player.position = players.indexOf(player);
            }
        });
        observable.propertyChange(api.listen.add_active_player, players_);
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

    function updateCapturedState() {
        var loops = ModuleGraph.getLoops(convertDataArrayForGraphModule(activePlayer.getDots()));
        var enemyDots = convertDataArrayForGraphModule(getEnemyPlayerDots());
        var trappedDotsCount = 0;
        loops = ModuleGraph.getCorrectLoops(loops, loopCheckers, enemyDots);
        //logger.log(stepNumber++, loops.concat(activePlayer.getDots()[0]));
        if (loops.length) {
            loops.forEach(function(loop) {
                var trappedDots = ModuleGraph.filterVertexesInsideLoop(enemyDots, loop);
                var trappedDotsData;
                if (trappedDots && trappedDots.length) {
                    trappedDotsData = convertGraphDataToDataArray(trappedDots);
                    activePlayer.addTrappedDots(trappedDotsData);
                    activePlayer.addLoop(loop);
                    enemyPlayers[0].addLosingDots(trappedDotsData);
                    graphics.renderLoop(convertGraphDataToDataArray(loop));
                    trappedDotsCount += trappedDots.length;
                }
            });
            if (trappedDotsCount) {
                observable.propertyChange(api.listen.conquer_dots, activePlayer);
            }
        }
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

    function getEnemyPlayersTrappedDots() {
        var result = [];
        enemyPlayers.forEach(function(player) {
            result = result.concat(player.getTrappedDots());
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

    function convertGraphDataToDataArray(data) {
        return data.map(function(graphData) {
            return gameDataMatrix[graphData.x][graphData.y];
        });
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
       /* Backend.on(Backend.event.add_dot, function listenEnemyAddDot() {

        });

        Backend.on(Backend.event.add_client, function listenAddClient(client) {
            if (addClient(client)) {
                observable.propertyChange(api.listen.add_client, client);
            }
        });

        Backend.on(Backend.event.invite, function invitePlayer(client) {
            observable.propertyChange(api.listen.invite_player, client);
        });*/
    }

    api = {
        init: function (mode_, graphics_, data_, gameDataMatrix_, logger_) {
            mode = mode_;
            graphics = graphics_;
            gameData = data_;
            logger = logger_;
            gameDataMatrix = gameDataMatrix_;
            init();
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,
        invitePlayer: function(player) {
            return transportUtils.invitePlayer(player);
        },
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

        invite: {
            ask: function(client) {
                return Backend.emit.inviteAsk(client);
            },
            success: function(client) {
                return Backend.emit.inviteSuccess(client);
            },
            reject: function(client) {
                return Backend.emit.inviteReject(client);
            }
        },
        listen: {
            invite_player: 'invite_player',
            add_active_player: 'add_active_player',
            change_active_player: 'change_active_player',
            add_client: 'add_client',
            add_dot: 'add_dot',
            conquer_dots: 'conquer_dots'
        },
        modes: modes
    };
    ModuleGraph.sb(api);
    return api;
});