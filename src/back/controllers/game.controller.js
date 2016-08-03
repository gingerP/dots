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

GameController.prototype.onCancelGame = function(handler) {
    this.wss.addListener(events.cancel_game, handler);
};

GameController.prototype.invitePlayer = function() {

};

GameController.prototype.rejectPlayer = function() {

};

GameController.prototype.cancelGame = function(clients, game) {
    var connectionIds = _.map(clients, 'connection_id');
    this.transmitter.send(connectionIds, events.cancel_game, {
        clients: clients,
        game: game
    });
};

GameController.prototype.postConstructor = function(ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};

GameController.prototype.getName = function() {
    return constants.GAME_CONTROLLER;
};

module.exports = {
    class: GameController
};