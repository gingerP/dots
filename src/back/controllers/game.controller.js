var events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;
var _ = require('lodash');

function GameController() {}

GameController.prototype = Object.create(GenericController.prototype);
GameController.prototype.constructor = GameController;

GameController.prototype.onInvitePlayer = function() {

};

GameController.prototype.onRejectPlayer = function() {

};

GameController.prototype.onNewClient = function(handler) {
    this.wss.addListener(events.new_client, handler);
};

GameController.prototype.onReconnect = function(handler) {
    this.wss.addListener(events.client_reconnect, handler);
};

GameController.prototype.invitePlayer = function() {

};

GameController.prototype.rejectPlayer = function() {

};

GameController.prototype.postConstructor = function(ioc) {
    this.wss = ioc[constants.WSS];
};

GameController.prototype.getName = function() {
    return constants.GAME_CONTROLLER;
};

module.exports = {
    class: GameController
};