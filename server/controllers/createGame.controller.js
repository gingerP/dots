'use strict';

var IOC = require('../constants/ioc.constants');
var Events = require('../events');
var GenericController = require('./generic.controller').class;
var _ = require('lodash');

function CreateGameController() {
}

CreateGameController.prototype = Object.create(GenericController.prototype);
CreateGameController.prototype.constructor = CreateGameController;

CreateGameController.prototype.onInvitePlayer = function (handler) {
    this.wss.addListener(Events.INVITE.INVITE, handler);
};

CreateGameController.prototype.onSuccessPlayer = function (handler) {
    this.wss.addListener(Events.INVITE.SUCCESS, handler);
};

CreateGameController.prototype.onRejectPlayer = function (handler) {
    this.wss.addListener(Events.INVITE.REJECT, handler);
};

CreateGameController.prototype.onCancelGame = function (handler) {
    this.wss.addListener(Events.GAME.CANCEL, handler);
};

CreateGameController.prototype.invitePlayer = function (fromClient, toClient) {
    this.transmitter.send(toClient._id, Events.INVITE.INVITE, {
        from: fromClient
    });
};

CreateGameController.prototype.rejectPlayer = function (fromClient, toClient) {
    this.transmitter.send(fromClient._id, Events.INVITE.REJECT, {
        to: toClient
    });
};

CreateGameController.prototype.rejectPlayerBeLate = function (fromClient, toClient) {
    this.transmitter.send(fromClient._id, Events.INVITE.REJECT_TO_LATE, {
        to: toClient
    });
};

CreateGameController.prototype.successPlayer = function (fromClient, toClient, gameId, gameDataFrom, gameDataTo) {
    this.transmitter.send([fromClient._id, toClient._id], Events.INVITE.SUCCESS, {
        to: toClient,
        from: fromClient,
        game: gameId,
        gameData: {
            from: gameDataFrom,
            to: gameDataTo
        }
    });
};

CreateGameController.prototype.successPlayerBeLate = function (fromClient, toClient) {
    this.transmitter.send(toClient._id, Events.INVITE.SUCCESS_TO_LATE, {
        from: fromClient
    });
};

CreateGameController.prototype.cancelGame = function (clients, game) {
    var ids = _.map(clients, '_id');
    this.transmitter.send(ids, Events.GAME.CANCEL, {
        clients: clients,
        game: game
    });
};

CreateGameController.prototype.getName = function () {
    return IOC.CONTROLLER.CREATE_GAME;
};

CreateGameController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[IOC.COMMON.WSS];
    this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
};


module.exports = {
    class: CreateGameController
};
