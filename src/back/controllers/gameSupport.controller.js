'use strict';

var events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;

function GameSupportController() {
}

GameSupportController.prototype = Object.create(GenericController.prototype);
GameSupportController.prototype.constructor = GameSupportController;

GameSupportController.prototype.onInvitePlayer = function () {

};

GameSupportController.prototype.onRejectPlayer = function () {

};

GameSupportController.prototype.onNewClient = function (handler) {
    this.wss.addListener(events.new_client, handler);
};

GameSupportController.prototype.onReconnect = function (handler) {
    this.wss.addListener(events.client_reconnect, handler);
};

GameSupportController.prototype.invitePlayer = function () {

};

GameSupportController.prototype.rejectPlayer = function () {

};

GameSupportController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};

GameSupportController.prototype.getName = function () {
    return constants.GAME_SUPPORT_CONTROLLER;
};

module.exports = {
    class: GameSupportController
};
