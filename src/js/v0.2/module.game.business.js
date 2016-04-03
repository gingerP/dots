define([
    'd3',
    'observable'
], function (d3, Observable) {
    'use strict';

    var api;
    var graphics;
    var data;
    var players = [];
    var activePlayer;
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
        isDotFree
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

    //RULES-------------------------------------------

    function isDotFree(data) {
        return !hasPlayersDots(data.id);
    }

    function isDotsNeighbors(data1, data2) {
        return Math.abs(data1.xInd - data2.xInd) <= 1
            && Math.abs(data1.yInd - data2.yInd) <= 1;
    }

    function isDotsSelected(data1, data2) {
        return hasPlayersDots(data1.id, data2.id);
    }

    function isDotsBelongsToOnePlayer(data1, data2) {
        return players.some(function (player) {
            return player.hasDot(data1.id) && player.hasDot(data2.id);
        });
    }

    function isDotsBelongsToActivePlayer(data1, data2) {
        return activePlayer.hasDot(data1.id) && activePlayer.hasDot(data2.id);
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
                activePlayer.addDot(data.id);
                resolve(function () {
                    if (!isLocalMode()) {
                        api.makeNextPlayerActive();
                    }
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
        if (players.indexOf(player) > -1) {
            activePlayer = player;
            observable.propertyChange(api.listen.change_active_player, player);
        }
        return api;
    }

    function makeNextPlayerActive() {
        var index = players.indexOf(activePlayer);
        if (index === players.length - 1) {
            activePlayer = players[0];
        } else {
            activePlayer = players[index + 1];
        }
        return api;
    }

    api = {
        init: function (mode_, graphics_, data_) {
            mode = mode_;
            graphics = graphics_;
            data = data_;
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
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
            add_player: 'add_player'
        },
        modes: modes
    };
    return api;
});