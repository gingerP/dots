'use strict';

const Events = require('server/events');
const IOC = require('../constants/ioc.constants');
const GenericController = require('./generic.controller').class;
const Constants = require('../utils/constants');
const GameActions = Constants.GAME_ACTIONS;
const Joi = require('joi');

class GameController extends GenericController {

    onAction(handler) {
        this.wss.setHandler(
            Events.GAME.CANCEL.GAVE_UP(),
            this.validator({
                type: Joi.string().valid(GameActions.ALL).required()
            }),
            handler
        );
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
