define([
    'lodash',
    'common/module.transport',
    'utils/service-utils',
    'utils/constants',
    'services/business/game.storage'
], function (_, Transport, ServiceUtils, Constants, GameStorage) {
    'use strict';

    var api;
    var ClientApi = Constants.API.CLIENT;
    var GameApi = Constants.API.GAME;

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
            return Transport.send(ClientApi.LIST.GET, preparedParams);
        },
        isGameClosed: function (gameId) {
            return Transport.send(GameApi.IS_CLOSED, {id: gameId});
        },
        getGameState: function (gameId) {
            return Transport.send(GameApi.STATE.GET, {id: gameId});
        },
        getCurrentClientHistory: function getCurrentClientHistory() {
            var clientId = GameStorage.getClient()._id;

            return Transport.send(ClientApi.HISTORY.GET, {id: clientId});
        }
    };

    return api;
});