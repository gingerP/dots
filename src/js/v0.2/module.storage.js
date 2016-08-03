define([
    'storage'
], function (Storage) {
    var storage = initStorage();
    var CLIENT = 'client';
    var OPPONENT = 'opponent';
    var GAME_ID = 'game_id';

    function initStorage() {
        console.info('initStorage');
        return new Storage({
            // Namespace. Namespace your Basil stored data
            // default: 'b45i1'
            namespace: 'dots',
            // storages. Specify all Basil supported storages and priority order
            // default: `['local', 'cookie', 'session', 'memory']`
            storages: ['cookie', 'session'],
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
        return function() {
            storage.remove(key);
        }
    }

    return {
        set: set,
        get: get,

        setClient: genericSet(CLIENT),
        getClient: genericGet(CLIENT),
        clearClient: genericClear(CLIENT),

        setOpponent: genericSet(OPPONENT),
        getOpponent: genericGet(OPPONENT),
        clearOpponent: genericClear(OPPONENT),

        setGameId: genericSet(GAME_ID),
        getGameId: genericGet(GAME_ID),
        clearGameId: genericClear(GAME_ID)
    }
});