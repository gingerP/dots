'use strict';

var Events = require('server/events');
var IOC = require('../constants/ioc.constants');
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
    this.wss.setHandler(Events.DOT.ADD(), handler);
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
        Events.GAME.STEP.NEW(),
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
    this.wss = ioc[IOC.COMMON.WSS];
    this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
};

GameController.prototype.getName = function () {
    return IOC.CONTROLLER.GAME;
};

module.exports = {
    class: GameController
};
