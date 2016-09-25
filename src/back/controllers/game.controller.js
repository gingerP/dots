'use strict';

var events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;
var _ = require('lodash');

function GameController() {}

GameController.prototype = Object.create(GenericController.prototype);
GameController.prototype.constructor = GameController;

GameController.prototype.onAddDot = function(handler) {
    this.wss.addListener(events.add_dot, handler);
};

GameController.prototype.invitePlayer = function() {

};

GameController.prototype.rejectPlayer = function() {

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