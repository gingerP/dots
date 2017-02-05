'use strict';

var GenericService = require('./generic.service').class;
const IOC = req('server/constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var Promise = require('bluebird');
var logger = req('server/logging/logger').create('GameDataService');
var errorLog = funcUtils.error(logger);
var sessionUtils = req('server/utils/session-utils');
const _ = require('lodash');

function aggregateGamesHistory(data) {
/*    var gameDataObject = {};
    _.forEach(data.gamesData, function(gameData) {
        gameDataObject[String(gameData._id)] = gameDataObject[String(gameData._id)] || [];
        gameDataObject[String(gameData._id)].push(prepareGameData(gameData));
    });
    _.forEach(data.games, function (game) {
//        game[]
    });*/
}

function GameDataService() {
}

GameDataService.prototype = Object.create(GenericService.prototype);
GameDataService.prototype.constructor = GameDataService;

GameDataService.prototype.onGetClients = function (data) {
    this.clientsDBManager.getOnlineClients().then(data.callback);
};

GameDataService.prototype.onGetMySelf = function (message) {
    var clientId = sessionUtils.getClientId(message.client.getSession());
    this.clientsDBManager.get(clientId).then(message.callback);
};

GameDataService.prototype.onReject = function () {

};

GameDataService.prototype.onSuccess = function () {

};

/**
 *
 * @param clientId - client id, whose history is loaded
 */

GameDataService.prototype.getGamesHistory = function (clientId) {

   /* return Promise.props({
        games: this.gameDBManager.getGamesHistoryForClient(clientId),
        gamesData: this.gameDataDBManager.loadGameDataForStatistic(clientId)
    }).then(aggregateGamesHistory)
        .catch(errorLog);*/
};

GameDataService.prototype.onGetGameState = function (message) {
    let inst = this;
    //noinspection Eslint,Eslint
    let gameData;
    let game;
    const gameId = message.data.id;
    return Promise.all([
        this.gameDBManager.get(gameId),
        this.gameDataDBManager.getGameDataForGame(gameId)
    ]).then(function (data) {
        game = data[0];
        gameData = data[1];
        if (!game) {
            game = null;
            gameData = null;
            return null;
        }
        return inst.clientsDBManager.get([game.to, game.from]);
    }).then(function (clients) {
        message.callback({
            game: game,
            gameData: gameData,
            clients: clients
        });
    }).catch(errorLog);
};

GameDataService.prototype.onIsGameClosed = function (message) {
    this.gameDBManager.get(message.data.id).then(function (game) {
        if (game) {
            message.callback(game.status === gameStatuses.closed);
        } else {
            message.callback(false);
        }
    }).catch(errorLog);
};

GameDataService.prototype.getName = function () {
    return IOC.SERVICE.GAME_DATA;
};

GameDataService.prototype.postConstructor = function (ioc) {
    this.gameSupportService = ioc[IOC.SERVICE.GAME_SUPPORT];
    this.gameDataController = ioc[IOC.CONTROLLER.GAME_DATA];
    this.controller = ioc[IOC.CONTROLLER.GAME_DATA];
    this.controller.onGetGamesHistory(this.getGamesHistory.bind(this));
    this.controller.onGetClientsList(this.onGetClients.bind(this));
    this.controller.onGetMyself(this.onGetMySelf.bind(this));
    this.controller.onIsGameClosed(this.onIsGameClosed.bind(this));
    this.controller.onGetGameState(this.onGetGameState.bind(this));
    this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
    this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
    this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
};

module.exports = {
    class: GameDataService
};
