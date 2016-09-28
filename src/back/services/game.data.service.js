var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var Promise = require('q');
var logger = _req('src/js/logger').create('GameDataService');
var errorLog = funcUtils.error(logger);

function GameDataService() {
}

GameDataService.prototype = Object.create(GenericService.prototype);
GameDataService.prototype.constructor = GameDataService;

GameDataService.prototype.onGetClients = function (data) {
    this.clientsDBManager.list().then(data.callback);
};

GameDataService.prototype.onGetMySelf = function (data) {
    this.clientsDBManager.getByCriteria({connection_id: data.client.getId()}).then(data.callback);
};

GameDataService.prototype.onReject = function () {

};

GameDataService.prototype.onSuccess = function () {

};

GameDataService.prototype.onGetGameState = function (message) {
    var inst = this;
    var gameId = message.data.id;
    var gameData;
    var game;
    return Promise.all([
        this.gameDBManager.get(gameId),
        this.gameDataDBManager.getGameDataForGame(gameId)
    ]).then(function(data) {
        game = data[0];
        gameData = data[1];
        if (!game) {
            game = null;
            gameData = null;
            return null;
        }
        return inst.clientsDBManager.get([game.to, game.from]);
    }).then(function(clients) {
        message.callback({
            game: game,
            gameData: gameData,
            clients: clients
        });
    }).catch(errorLog);
};

GameDataService.prototype.onIsGameClosed = function (message) {
    this.gameDBManager.get(message.data.id).then(function(game) {
        if (game) {
            message.callback(game.status === gameStatuses.closed);
        } else {
            message.callback(false);
        }
    }).catch(errorLog);
};

GameDataService.prototype.getName = function () {
    return constants.GAME_DATA_SERVICE;
};

GameDataService.prototype.postConstructor = function (ioc) {
    var inst = this;
    this.gameSupportService = ioc[constants.GAME_SUPPORT_SERVICE];
    this.gameDataController = ioc[constants.GAME_DATA_CONTROLLER];
    this.controller = ioc[constants.GAME_DATA_CONTROLLER];
    this.controller.onGetClientsList(this.onGetClients.bind(this));
    this.controller.onGetMyself(this.onGetMySelf.bind(this));
    this.controller.onIsGameClosed(this.onIsGameClosed.bind(this));
    this.controller.onGetGameState(this.onGetGameState.bind(this));
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    this.gameDataDBManager = ioc[constants.GAME_DATA_DB_MANAGER];
};

module.exports = {
    class: GameDataService
};