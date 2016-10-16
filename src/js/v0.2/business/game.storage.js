define([
    'storage',
    'business/domains/Player'
], function (Storage, Player) {
    'use strict';

    var api;
    var storage = initStorage();
    var gamers = {
        client: null,
        opponent: null
    };
    var activeGamePlayer;
    var keys = {
        NETWORK_MODE: 'network_mode',
        ACTIVE_GAMER_ID: 'active_gamer_id',
        CLIENT: 'client',
        OPPONENT: 'opponent',
        GAME: 'game'
    };

    function initStorage() {
        return new Storage({
            // Namespace. Namespace your Basil stored data
            // default: 'b45i1'
            namespace: 'dots',
            // storages. Specify all Basil supported storages and priority order
            // default: `['local', 'cookie', 'session', 'memory']`
            storages: ['local', 'cookie'],
            // expireDays. Default number of days before cookies expiration
            // default: 365
            expireDays: 31
        });
    }

    function set(key, value) {
        storage.set(key, value);
    }

    function get(key) {
        return storage.get(key);
    }

    function remove(key) {
        return storage.remove(key);
    }

    function gamerSet(key) {
        return function (obj) {
            if (obj) {
                set(key, obj);
                if (!gamers[key]) {
                    gamers[key] = new Player().init(obj._id, obj.name, obj.color, '');
                } else {
                    gamers[key].id = obj._id;
                    gamers[key].name = obj.name;
                    gamers[key].color = obj.color;
                }
            }
        };
    }

    function gamerGet(key) {
        return function () {
            return get(key);
        };
    }

    function genericSet(key) {
        return function (value) {
            set(key, value);
        };
    }

    function genericGet(key) {
        return function () {
            return get(key);
        };
    }

    function genericClear(key) { //eslint-disable-line
        return function () {
            storage.remove(key);
        };
    }

    function hasOpponent() {
        return Boolean(gamers.opponent);
    }

    function setGameClient(clientObj) {
        gamers.client = clientObj;
    }

    function getGameClient() {
        return gamers.client;
    }

    function clearClient() {
        delete gamers.client;
        storage.remove(keys.CLIENT);
    }

    function setGameOpponent(opponentObj) {
        gamers.opponent = opponentObj;
    }

    function getGameOpponent() {
        return gamers.opponent;
    }

    function clearOpponent() {
        delete gamers.opponent;
        storage.remove(keys.OPPONENT);
    }

    function getGamePlayers() {
        var result = [];
        if (gamers.client) {
            result.push(gamers.client);
        }
        if (gamers.opponent) {
            result.push(gamers.opponent);
        }
        return result;
    }

    function getPlayers() {
        var result = [];
        var client = get(keys.CLIENT);
        var opponent = get(keys.OPPONENT);
        if (client) {
            result.push(client);
        }
        if (opponent) {
            result.push(opponent);
        }
        return result;
    }

    function getActiveGamePlayer() {
        var playerId = get(keys.ACTIVE_GAMER_ID);
        if (playerId && !activeGamePlayer) {
            if (gamers.client && playerId === gamers.client.getId()) {
                activeGamePlayer = gamers.client;
            }
            if (gamers.opponent && playerId === gamers.opponent.getId()) {
                activeGamePlayer = gamers.opponent;
            }
        }
        return activeGamePlayer;
    }

    function setActiveGamePlayer(gamePlayer) {
        set(keys.ACTIVE_GAMER_ID, gamePlayer.id);
        return api;
    }

    function deleteActiveGamePlayer() {
        activeGamePlayer = null;
        remove(keys.ACTIVE_GAMER_ID);
        return api;
    }

    function getClientForGamer(gamer) {
        if (gamer === gamers.client) {
            return get(keys.CLIENT);
        } else if (gamer === gamers.OPPONENT) {
            return get(keys.OPPONENT);
        }
        return null;
    }

    function hasGame() {
        return Boolean(get(keys.GAME));
    }

    function clearGame() {
        deleteActiveGamePlayer();
        clearOpponent();
        remove(keys.GAME);
    }

    function getGamePlayerById(playerId) {
        if (gamers.client && gamers.client.getId() === playerId) {
            return gamers.client;
        }
        if (gamers.opponent && gamers.opponent.getId() === playerId) {
            return gamers.opponent;
        }
        return null;
    }

    api = {
        set: set,
        get: get,

        setGameMode: genericSet(keys.NETWORK_MODE),
        getGameMode: genericGet(keys.NETWORK_MODE),

        setGameClient: setGameClient,
        getGameClient: getGameClient,
        setClient: gamerSet(keys.CLIENT),
        getClient: gamerGet(keys.CLIENT),
        clearClient: clearClient,

        setGameOpponent: setGameOpponent,
        getGameOpponent: getGameOpponent,
        setOpponent: gamerSet(keys.OPPONENT),
        getOpponent: gamerGet(keys.OPPONENT),
        clearOpponent: clearOpponent,
        hasOpponent: hasOpponent,

        getClientForGamer: getClientForGamer,
        getPlayers: getPlayers,

        getGamePlayers: getGamePlayers,

        getActiveGamePlayer: getActiveGamePlayer,
        setActiveGamePlayer: setActiveGamePlayer,
        deleteActiveGamePlayer: deleteActiveGamePlayer,

        getGamePlayerById: getGamePlayerById,

        setGame: genericSet(keys.GAME),
        getGame: genericGet(keys.GAME),
        clearGame: clearGame,
        hasGame: hasGame
    };

    api.setClient(get(keys.CLIENT));
    api.setOpponent(get(keys.OPPONENT));

    return api;
});
