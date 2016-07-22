var GenericService = require('./generic.service').class;
var constants = require('../constants');
var funcUtils = require('../utils/function-utils');

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

GameDataService.prototype.getAnimals = function () {
    return animals;
};

GameDataService.prototype.getName = function () {
    return constants.GAME_DATA_SERVICE;
};

GameDataService.prototype.postConstructor = function (ioc) {
    var inst = this;
    this.gameService = ioc[constants.GAME_SERVICE];
    this.gameDataController = ioc[constants.GAME_DATA_CONTROLLER];
    this.controller = ioc[constants.GAME_DATA_CONTROLLER];
    this.controller.onGetClientsList(funcUtils.wrapListener(this, this.onGetClients));
    this.controller.onGetMyself(funcUtils.wrapListener(this, this.onGetMySelf));
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
};

module.exports = {
    class: GameDataService
};