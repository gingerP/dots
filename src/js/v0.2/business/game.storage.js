define([
    'storage',
    'business/module.game.player',
    'business/module.game.player.history'
], function (Storage, Player, PlayerHistory) {
    'use strict';

    var api;
    var storage = initStorage();
    var gamers = {
        client: null,
        opponent: null
    };
    var keys = {
        CLIENT: 'client',
        OPPONENT: 'opponent',
        GAME: 'game'
    };
    var isOpponentExist = false;

    function initStorage() {
        return new Storage({
            // Namespace. Namespace your Basil stored data
            // default: 'b45i1'
            namespace: 'dots',
            // storages. Specify all Basil supported storages and priority order
            // default: `['local', 'cookie', 'session', 'memory']`
            storages: ['session', 'cookie'],
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

    function gamerSet(key) {
        return function (obj) {
            if (obj) {
                set(key, obj);
                if (!gamers[key]) {
                    gamers[key] = new Player().init(obj._id, obj.name, obj.color, '', new PlayerHistory());
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
        }
    }

    function genericGet(key) {
        return function () {
            return get(key);
        }
    }

    function genericClear(key) {
        return function () {
            storage.remove(key);
        }
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
        storage.remove(keys.CLIENT)
    }

    function setGameOpponent(opponentObj) {
        gamers.opponent = opponentObj;
    }

    function getGameOpponent() {
        return gamers.opponent;
    }

    function clearOpponent() {
        delete gamers.opponent;
        storage.remove(keys.OPPONENT)
    }

    api = {
        set: set,
        get: get,

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

        setGame: genericSet(keys.GAME),
        getGame: genericGet(keys.GAME),
        clearGame: genericClear(keys.GAME)
    };

    api.setClient(get(keys.CLIENT));
    api.setOpponent(get(keys.OPPONENT));

    return api;
});