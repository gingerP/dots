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
         * @param {{search: string, isOnline: boolean}} params params for searching, immutable
         * @returns {Promise<Gamer[]>} searched clients
         */
        getClients: function getClients(params) {
            var preparedParams = _.cloneDeep(params);
            if (!preparedParams.search) {
                delete preparedParams.search;
            }
            return Transport.send(preparedParams, BackendEvents.CLIENT.LIST.GET);
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