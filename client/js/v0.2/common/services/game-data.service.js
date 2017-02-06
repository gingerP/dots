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
            return Transport.send({}, BackendEvents.DATA.GET_CLIENTS_LIST);
        },
        isGameClosed: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.DATA.IS_GAME_CLOSED);
        },
        getGameState: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.DATA.GET_GAME_STATE);
        },
        getCurrentClientHistory: function getCurrentClientHistory() {
            var clientId = GameStorage.getClient()._id;

            return Transport.send({id: clientId}, BackendEvents.DATA.CLIENT_HISTORY);
        }
    };

    return api;
});