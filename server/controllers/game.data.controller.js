'use strict';

const IOC = require('../constants/ioc.constants');
const Events = require('server/events');
const GenericController = require('./generic.controller').class;
const Joi = require('joi');

function GameDataController() {
}

GameDataController.prototype = Object.create(GenericController.prototype);
GameDataController.prototype.constructor = GameDataController;

GameDataController.prototype.onGetClientsList = function (handler) {
    this.wss.setHandler(
        Events.CLIENT.LIST.GET,
        this.validator({
            search: Joi.string().min(1).optional(),
            isOnline: Joi.boolean().optional(),
            page: Joi.number().integer().min(1).required(),
            pageSize: Joi.number().integer().min(1).required(),
            order: Joi.object().keys(
                {
                    rating: Joi.number().valid([-1, 1])
                }
            ).optional(),
            excludeGameUsers: Joi.boolean().optional(),
            includeInvites: Joi.boolean().optional()
        }),
        handler);
};

GameDataController.prototype.onGetInvites = function (handler) {
    this.wss.setHandler(
        Events.CLIENT.INVITES.LIST,
        this.validator({}),
        handler
    );
};

GameDataController.prototype.onGetMyself = function (handler) {
    this.wss.setHandler(Events.CLIENT.MYSELF.GET, handler);
};

GameDataController.prototype.onGetGameState = function (handler) {
    this.wss.setHandler(Events.GAME.STATE.GET, handler);
};

GameDataController.prototype.onGetClientHistory = function (handler) {
    this.wss.setHandler(Events.CLIENT.HISTORY.GET, function (message) {
        var clientId = message.data.id;
        return handler(clientId, message.client).then(message.callback);
    });
};

GameDataController.prototype.onGetEvents = function () {
    this.wss.setHandler(Events.EVENTS.LIST.GET, function (data) {
        data.callback(Events);
    });
};

GameDataController.prototype.onIsGameClosed = function (handler) {
    this.wss.setHandler(Events.GAME.IS_CLOSED, handler);
};

GameDataController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[IOC.COMMON.WSS];
};

GameDataController.prototype.getName = function () {
    return IOC.CONTROLLER.GAME_DATA;
};

module.exports = {
    class: GameDataController
};
