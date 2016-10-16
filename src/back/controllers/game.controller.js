'use strict';

var Events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;

function GameController() {
}

GameController.prototype = Object.create(GenericController.prototype);
GameController.prototype.constructor = GameController;

GameController.prototype.onAddDot = function (handler) {
    this.wss.addListener(Events.add_dot, handler);
};

GameController.prototype.nextStep = function (
    dot,
    previousPlayer,
    previousPlayerGameData,
    currentPlayer,
    currentPlayerGameData,
    game) {
    this.transmitter.send(
        [previousPlayer.connection_id, currentPlayer.connection_id],
        Events.game_step,
        {
            dot: dot,
            previousPlayerId: previousPlayer._id,
            previousPlayerGameData: previousPlayerGameData,
            currentPlayerId: currentPlayer._id,
            currentPlayerGameData: currentPlayerGameData,
            game: game
        }
    );
};

GameController.prototype.invitePlayer = function () {

};

GameController.prototype.rejectPlayer = function () {

};

GameController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};

GameController.prototype.getName = function () {
    return constants.GAME_CONTROLLER;
};

module.exports = {
    class: GameController
};
