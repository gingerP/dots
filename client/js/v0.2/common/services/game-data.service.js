define([
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events',
    'business/game.storage'
], function (Transport, ServiceUtils, BackendEvents, GameStorage) {
    'use strict';

    var api;

    api = {
        listen: {},
        getClients: function getClients() {
            return Transport.send({}, BackendEvents.CLIENT.LIST.GET);
        },
        isGameClosed: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.GAME.IS_CLOSED);
        },
        getGameState: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.GAME.STATE.GET);
        },
        getCurrentClientHistory: function getCurrentClientHistory() {
            var clientId = GameStorage.getClient()._id;

            return Transport.send({id: clientId}, BackendEvents.CLIENT.HISTORY.GET);
        }
    };

    return api;
});