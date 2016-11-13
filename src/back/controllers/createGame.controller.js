'use strict';

var constants = require('../constants/constants');
var events = require('../events');
var GenericController = require('./generic.controller').class;
var _ = require('lodash');

function CreateGameController() {
}

CreateGameController.prototype = Object.create(GenericController.prototype);
CreateGameController.prototype.constructor = CreateGameController;

CreateGameController.prototype.onInvitePlayer = function (handler) {
    this.wss.addListener(events.invite_player, handler);
};

CreateGameController.prototype.onSuccessPlayer = function (handler) {
    this.wss.addListener(events.success_invite_player, handler);
};

CreateGameController.prototype.onRejectPlayer = function (handler) {
    this.wss.addListener(events.reject_invite_player, handler);
};

CreateGameController.prototype.onCancelGame = function (handler) {
    this.wss.addListener(events.cancel_game, handler);
};

CreateGameController.prototype.invitePlayer = function (fromClient, toClient) {
    this.transmitter.send(toClient._id, events.invite_player, {
        from: fromClient
    });
};

CreateGameController.prototype.rejectPlayer = function (fromClient, toClient) {
    this.transmitter.send(fromClient._id, events.reject_invite_player, {
        to: toClient
    });
};

CreateGameController.prototype.rejectPlayerBeLate = function (fromClient, toClient) {
    this.transmitter.send(fromClient._id, events.reject_invite_player_to_late, {
        to: toClient
    });
};

CreateGameController.prototype.successPlayer = function (fromClient, toClient, gameId) {
    this.transmitter.send([fromClient._id, toClient._id], events.success_invite_player, {
        to: toClient,
        from: fromClient,
        game: gameId
    });
};

CreateGameController.prototype.successPlayerBeLate = function (fromClient, toClient) {
    this.transmitter.send(toClient._id, events.success_invite_player_to_late, {
        from: fromClient
    });
};

CreateGameController.prototype.cancelGame = function (clients, game) {
    var ids = _.map(clients, '_id');
    this.transmitter.send(ids, events.cancel_game, {
        clients: clients,
        game: game
    });
};

CreateGameController.prototype.getName = function () {
    return constants.CREATE_GAME_CONTROLLER;
};

CreateGameController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};


module.exports = {
    class: CreateGameController
};
