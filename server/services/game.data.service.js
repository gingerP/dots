'use strict';

var GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var Promise = require('bluebird');
var logger = require('server/logging/logger').create('GameDataService');
var errorLog = funcUtils.error(logger);
var sessionUtils = require('server/utils/session-utils');
const Errors = require('../errors');

class GameDataService extends GenericService {


    async onGetClients(data) {
        return this.clientsDBManager.getOnlineClients().then(data.callback);
    }

    async onGetMySelf(message) {
        var clientId = sessionUtils.getClientId(message.client.getSession());
        return this.clientsDBManager.get(clientId).then(message.callback);
    };

    async onReject() {

    }

    async onSuccess() {

    }

    /**
     *
     * @param clientId - client id, whose history is loaded
     */

    async getClientHistory(clientId) {
        return this.clientHistory.aggregate(clientId);
    }

    /**
     *
     * @param {SocketMessage} message
     * @returns {Promise.<null>}
     */
    async onGetGameState(message) {
        const gameId = message.data.id;
        const [game, usersGameDataList] = await Promise.all([
            this.gameDBManager.get(gameId),
            this.gameDataDBManager.getGameDataForGame(gameId)
        ]);

        if (!game) {
            return message.callback({});
        }
        const users = await this.clientsDBManager.get([game.to, game.from]);
        message.callback({
            game: game,
            gameData: usersGameDataList,
            clients: users
        });
    }

    async onIsGameClosed(message) {
        this.gameDBManager.get(message.data.id).then(function (game) {
            if (game) {
                message.callback(game.status === gameStatuses.closed);
            } else {
                message.callback(false);
            }
        }).catch(errorLog);
    }

    getName() {
        return IOC.SERVICE.GAME_DATA;
    }

    bindApi() {
        this.controller.onGetClientHistory(this.getClientHistory.bind(this));
        this.controller.onGetClientsList(this.onGetClients.bind(this));
        this.controller.onGetMyself(this.onGetMySelf.bind(this));
        this.controller.onIsGameClosed(this.onIsGameClosed.bind(this));
        this.controller.onGetGameState(this.onGetGameState.bind(this));
    }

    applyInjection(ioc) {
        this.gameSupportService = ioc[IOC.SERVICE.GAME_SUPPORT];
        this.controller = ioc[IOC.CONTROLLER.GAME_DATA];
        this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
        this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
        this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
        this.clientHistory = ioc[IOC.DB_MANAGER.CLIENTS_HISTORY_AGGREGATE];
    };

    postConstructor(ioc) {
        this.applyInjection(ioc);
        this.bindApi();
    }
}

module.exports = {
    class: GameDataService
};
