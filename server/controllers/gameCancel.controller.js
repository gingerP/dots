'use strict';

const Events = require('server/events');
const IOC = require('../constants/ioc.constants');
const GenericController = require('./generic.controller').class;
const Constants = require('../utils/constants');
const GameActions = Constants.GAME_ACTIONS;
const Joi = require('joi');

class GameController extends GenericController {

    onCancel(handler) {
        this.wss.setHandler(
            Events.GAME.CANCEL.GAVE_UP,
            this.validator({
                type: Joi.string().valid(GameActions.ALL).required()
            }),
            handler
        );
    }

    onCancelReply(handler) {
        this.wss.setHandler(
            Events.GAME.CANCEL.GAVE_UP,
            this.validator({
                type: Joi.string().valid(GameActions.ALL).required(),
                success: Joi.boolean().required()
            }),
            handler
        );
    }

    async notifyCancel(userId, action) {
        return this.transmitter.send(
            Events.GAME.STEP.NEW,
            [userId],
            {
                dot: dot,
                previous: {gamerId: previousPlayer._id, gameData: previousPlayerGameData, delta: previousPlayerDelta},
                current: {gamerId: currentPlayer._id, gameData: currentPlayerData, delta: currentPlayerDelta},
                game: game
            }
        );
    }

    notifyCancelReply() {

    }

    postConstructor(ioc) {
        this.wss = ioc[IOC.COMMON.WSS];
        this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
    }

    getName() {
        return IOC.CONTROLLER.GAME_CANCEL;
    }
}

module.exports = {
    class: GameController
};
