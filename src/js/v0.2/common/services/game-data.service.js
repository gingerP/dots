define([
    'module.transport',
    'utils/service-utils',
    'common/backend-events'
], function (Transport, ServiceUtils, BackendEvents) {
    'use strict';

    var api;

    api = {
        listen: {
            disconnectClient: ServiceUtils.createListener(BackendEvents.GENERAL.CLIENT_DISCONNECT),
            newClient: ServiceUtils.createListener(BackendEvents.GENERAL.NEW_CLIENT)
        },
        getClients: function getClients() {
            return Transport.send({}, BackendEvents.DATA.GET_CLIENTS_LIST);
        },
        isGameClosed: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.DATA.IS_GAME_CLOSED);
        },
        getGameState: function (gameId) {
            return Transport.send({id: gameId}, BackendEvents.DATA.GET_GAME_STATE);
        }
    };

    return api;
});