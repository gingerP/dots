'use strict';

var IOC = require('../constants/ioc.constants');
var Events = require('../events');
var GenericController = require('./generic.controller').class;

function GameDataController() {
}

GameDataController.prototype = Object.create(GenericController.prototype);
GameDataController.prototype.constructor = GameDataController;

GameDataController.prototype.onGetClientsList = function (handler) {
    this.wss.addListener(Events.get_clients_list, handler);
};

GameDataController.prototype.onGetMyself = function (handler) {
    this.wss.addListener(Events.get_myself, handler);
};

GameDataController.prototype.onGetGameState = function (handler) {
    this.wss.addListener(Events.get_game_state, handler);
};

GameDataController.prototype.onGetGamesHistory = function (handler) {
    this.wss.addListener(Events.GAMES_HISTORY.LIST, function (message) {
        var clientId = message.data.clientId;
        return handler(clientId, message.client).then(message.callback);
    });
};

GameDataController.prototype.onGetEvents = function () {
    this.wss.addListener(Events.get_events, function (data) {
        data.callback(Events);
    });
};

GameDataController.prototype.onIsGameClosed = function (handler) {
    this.wss.addListener(Events.is_game_closed, handler);
};

GameDataController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[IOC.COMMON.WSS];
};

GameDataController.prototype.getName = function () {
    return IOC.CONTROLLER.GAME_DATA;
};

module.exports = {
    class: GameDataController
};
