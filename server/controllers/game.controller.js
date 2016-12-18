'use strict';

var Events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;

function extractStepData(stepData) {
    return {
        gamerId: stepData.gamer._id,
        gameData: stepData.gameData,
        delta: stepData.delta
    };
}

function GameController() {
}

GameController.prototype = Object.create(GenericController.prototype);
GameController.prototype.constructor = GameController;

GameController.prototype.onAddDot = function (handler) {
    this.wss.addListener(Events.add_dot, handler);
};

GameController.prototype.nextStep = function (dot,
                                              previousPlayerStepData,
                                              currentPlayerStepData,
                                              game) {
    this.transmitter.send(
        [
            previousPlayerStepData.gamer._id,
            currentPlayerStepData.gamer._id
        ],
        Events.game_step,
        {
            dot: dot,
            previous: extractStepData(previousPlayerStepData),
            current: extractStepData(currentPlayerStepData),
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
