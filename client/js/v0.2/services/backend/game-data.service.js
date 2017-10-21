define([
    'lodash',
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events',
    'services/business/game.storage'
], function (_, Transport, ServiceUtils, BackendEvents, GameStorage) {
    'use strict';

    var api;

    api = {
        listen: {},
        /**
         * Search clients with params
         * @param {{search: string, isOnline: boolean, page: page, pageSize: pageSize}} params params for searching,
         * immutable
         * @returns {Promise<Gamer[]>} searched clients
         */
        getClients: function getClients(params) {
            var preparedParams = _.cloneDeep(params);
            if (!preparedParams.search) {
                delete preparedParams.search;
            }
            return Transport.send(BackendEvents.CLIENT.LIST.GET, preparedParams);
        },
        isGameClosed: function (gameId) {
            return Transport.send(BackendEvents.GAME.IS_CLOSED, {id: gameId});
        },
        getGameState: function (gameId) {
            return Transport.send(BackendEvents.GAME.STATE.GET, {id: gameId});
        },
        getCurrentClientHistory: function getCurrentClientHistory() {
            var clientId = GameStorage.getClient()._id;

            return Transport.send(BackendEvents.CLIENT.HISTORY.GET, {id: clientId});
        }
    };

    return api;
});