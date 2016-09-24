var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var Promise = require('q');
var logger = _req('src/js/logger').create('GameDataService');

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
    return this.gameDBManager.get(message.data.id).then(function(game) {

    }).catch(funcUtils.error(logger));
};

GameDataService.prototype.onIsGameClosed = function (message) {
    this.gameDBManager.get(message.data.id).then(function(game) {
        if (game) {
            message.callback(game.status === gameStatuses.closed);
        } else {
            message.callback(false);
        }
    }).catch(funcUtils.error(logger));
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
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
};

module.exports = {
    class: GameDataService
};