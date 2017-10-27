'use strict';

const IOC = require('../constants/ioc.constants');
const Events = require('server/events');
const GenericController = require('./generic.controller').class;
const _ = require('lodash');
const Joi = require('joi');

class CreateGameController extends GenericController {

    onInvitePlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.INVITE,
            this.validator({clientId: Joi.string().length(24).required()}),
            handler
        );
    }

    onSuccessPlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.SUCCESS,
            this.validator({clientId: Joi.string().length(24).required()}),
            handler);
    }

    onRejectPlayer(handler) {
        this.wss.setHandler(
            Events.INVITE.REJECT,
            this.validator({clientId: Joi.string().length(24).required()}),
            handler
        );
    }

    onCancelGame(handler) {
        this.wss.setHandler(
            Events.GAME.CANCEL,
            this.validator({gameId: Joi.string().length(24).required()}),
            handler
        );
    }

    invitePlayer(fromClient, toClient) {
        this.transmitter.send(Events.INVITE.INVITE, toClient._id, {from: fromClient});
    }

    rejectPlayer(fromClient, toClient) {
        this.transmitter.send(Events.INVITE.REJECT, fromClient._id, {to: toClient});
    }

    rejectPlayerBeLate(fromClient, toClient) {
        this.transmitter.send(Events.INVITE.REJECT_TO_LATE, fromClient._id, {to: toClient});
    }

    successPlayer(fromClient, toClient, gameId, gameDataFrom, gameDataTo) {
        this.transmitter.send(Events.INVITE.SUCCESS, [fromClient._id, toClient._id], {
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
        this.transmitter.send(Events.INVITE.SUCCESS_TO_LATE, toClient._id, {from: fromClient});
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
