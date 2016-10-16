'use strict';

var _ = require('lodash');
var Events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;

function GameSupportController() {
}

GameSupportController.prototype = Object.create(GenericController.prototype);
GameSupportController.prototype.constructor = GameSupportController;

GameSupportController.prototype.onNewClient = function (handler) {
    this.wss.addListener(Events.new_client, handler);
};

GameSupportController.prototype.onReconnect = function (handler) {
    this.wss.addListener(Events.client_reconnect, handler);
};

GameSupportController.prototype.notifyAboutNewClient = function(newClient, clients) {
    this.transmitter.send(_.map(clients, 'connection_id'), Events.new_client, newClient);
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
