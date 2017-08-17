'use strict';

const Events = require('server/events');
const IOC = require('../constants/ioc.constants');
const GenericController = require('./generic.controller').class;
const Joi = require('joi');

function extractStepData(stepData) {
    return {
        gamerId: stepData.gamer._id,
        gameData: stepData.gameData,
        delta: stepData.delta
    };
}

class GameController extends GenericController {

    onAddDot(handler) {
        this.wss.setHandler(
            Events.DOT.ADD(),
            this.validator({
                gameId: Joi.string().length(24).required(),
                x: Joi.number().integer().min(0).required(),
                y: Joi.number().integer().min(0).required()
            }),
            handler
        );
    }

    nextStep(dot,
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
    }

    invitePlayer() {

    }

    rejectPlayer() {

    }

    postConstructor(ioc) {
        this.wss = ioc[IOC.COMMON.WSS];
        this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
    }

    getName() {
        return IOC.CONTROLLER.GAME;
    }
}

module.exports = {
    class: GameController
};
