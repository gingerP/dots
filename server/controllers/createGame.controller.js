'use strict';

const IOC = require('../constants/ioc.constants');
const Events = require('server/events');
const GenericController = require('./generic.controller').class;
const _ = require('lodash');
const Joi = require('joi');

class CreateGameController extends GenericController {

    onInvitePlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.INVITE(),
            this.validator({clientId: Joi.string().length(24).required()}),
            handler
        )
    }

    onSuccessPlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.SUCCESS(),
            this.validator({clientId: Joi.string().length(24).required()}),
            handler);
    }

    onRejectPlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.REJECT(),
            this.validator({clientId: Joi.string().length(24).required()}),
            handler
        );
    }

    onCancelGame(handler) {
        this.wss.setHandler(
            Events.GAME.CANCEL(),
            this.validator({gameId: Joi.string().length(24).required()}),
            handler
        );
    }

    invitePlayer(fromClient, toClient) {
        this.transmitter.send(toClient._id, Events.INVITE.INVITE(), {
            from: fromClient
        });
    }

    rejectPlayer(fromClient, toClient) {
        this.transmitter.send(fromClient._id, Events.INVITE.REJECT(), {
            to: toClient
        });
    }

    rejectPlayerBeLate(fromClient, toClient) {
        this.transmitter.send(fromClient._id, Events.INVITE.REJECT_TO_LATE(), {
            to: toClient
        });
    }

    successPlayer(fromClient, toClient, gameId, gameDataFrom, gameDataTo) {
        this.transmitter.send([fromClient._id, toClient._id], Events.INVITE.SUCCESS(), {
            to: toClient,
            from: fromClient,
            game: gameId,
            gameData: {
                from: gameDataFrom,
                to: gameDataTo
            }
        });
    }

    successPlayerBeLate(fromClient, toClient) {
        this.transmitter.send(toClient._id, Events.INVITE.SUCCESS_TO_LATE(), {
            from: fromClient
        });
    }

    async cancelGame(clients, game) {
        const ids = _.map(clients, '_id');
        return this.transmitter.send(ids, Events.GAME.CANCEL(), {
            clients: clients,
            game: game
        });
    }

    getName() {
        return IOC.CONTROLLER.CREATE_GAME;
    }

    postConstructor(ioc) {
        this.wss = ioc[IOC.COMMON.WSS];
        this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
    }
}

module.exports = {
    class: CreateGameController
};
