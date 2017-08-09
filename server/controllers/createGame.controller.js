'use strict';

const IOC = require('../constants/ioc.constants');
const Events = require('server/events');
const GenericController = require('./generic.controller').class;
const _ = require('lodash');

class CreateGameController extends GenericController() {

    onInvitePlayer(handler) {
        this.wss.addListener(Events.INVITE.INVITE(), handler);
    }

    onSuccessPlayer(handler) {
        this.wss.addListener(Events.INVITE.SUCCESS(), handler);
    }

    onRejectPlayer(handler) {
        this.wss.addListener(Events.INVITE.REJECT(), handler);
    }

    onCancelGame(handler) {
        this.wss.addListener(Events.GAME.CANCEL(), handler);
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

    cancelGame(clients, game) {
        var ids = _.map(clients, '_id');
        this.transmitter.send(ids, Events.GAME.CANCEL(), {
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
