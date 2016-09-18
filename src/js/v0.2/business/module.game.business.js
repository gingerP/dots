define([
    'd3',
    'module.observable',
    'module.backend.service',
    'business/module.game.player',
    'business/business.invite',
    'business/game.rules',
    'business/game.storage'
], function (d3, Observable, Backend, Player, businessInvite, rules, gameStorage) {
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
        return rules.rulesCanChangeActivePlayer.every(function (rule) {
            return rule();
        });
    }

    //------------------------------------------------

    function isLocalMode() {
        return gameStorage.mode === gameStorage.mode.local;
    }

    function isNetworkMode() {
        return gameStorage.mode === gameStorage.mode.network;
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
              //  transportUtils.addDot(data);
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

    gameStorage.activePlayer = new Player();

    api = {
        init: function (graphics_) {
            graphics = graphics_;
            init();
            return api;
        },
        canConnectDots: canConnectDots,
        canSelectDot: canSelectDot,
        canChangeActivePlayer: canChangeActivePlayer,
        invitePlayer: function(player) {
            /*return transportUtils.invitePlayer(player);*/
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