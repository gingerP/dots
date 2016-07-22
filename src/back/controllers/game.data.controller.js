var constants = require('../constants');
var events = require('../events');
var GenericController = require('./generic.controller').class;

function GameDataController() {}

GameDataController.prototype = Object.create(GenericController.prototype);
GameDataController.prototype.constructor = GameDataController;

GameDataController.prototype.onGetClientsList = function(handler) {
    this.wss.addListener(events.get_clients_list, handler);
};

GameDataController.prototype.onGetMyself = function(handler) {
    this.wss.addListener(events.get_myself, handler);
};

GameDataController.prototype.onRejectPlayer = function(handler) {
};

GameDataController.prototype.onGetEvents = function() {
    this.wss.addListener(events.get_events, function(data) {
        data.callback(events);
    });
};

GameDataController.prototype.postConstructor = function(ioc) {
    this.wss = ioc[constants.WSS];
};

GameDataController.prototype.getName = function() {
    return constants.GAME_DATA_CONTROLLER;
};

module.exports = {
    class: GameDataController
};