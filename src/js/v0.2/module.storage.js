define([
    'storage'
], function (Storage) {
    var storage = initStorage();

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

    function setClient(client) {
        set('client', client);
    }

    function getClient() {
        return get('client');
    }

    return {
        set: set,
        get: get,
        setClient: setClient,
        getClient: getClient
    }
});