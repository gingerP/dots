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

    /**
     *
     * @param {Dot} dot
     * @param {Gamer} previousPlayer
     * @param {GameData} previousPlayerGameData
     * @param {GameDataDelta} previousPlayerDelta
     * @param {Gamer} currentPlayer
     * @param {GameData} currentPlayerData
     * @param {GameDataDelta} currentPlayerDelta
     * @param {Game} game
     * @returns {Promise.<void>}
     */
    async nextStep(dot,
                   previousPlayer, previousPlayerGameData, previousPlayerDelta,
                   currentPlayer, currentPlayerData, currentPlayerDelta, game) {
        return this.transmitter.send(
            [
                previousPlayer._id,
                currentPlayer._id
            ],
            Events.GAME.STEP.NEW(),
            {
                dot: dot,
                previous: {gamerId: previousPlayer._id, gameData: previousPlayerGameData, delta: previousPlayerDelta},
                current: {gamerId: currentPlayer._id, gameData: currentPlayerData, delta: currentPlayerDelta},
                game: game
            }
        );
    }

	async invitePlayer() {

    }

	async rejectPlayer() {

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
