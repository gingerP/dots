var constants = require('../constants');
var events = require('../events');
var GenericController = require('./generic.controller').class;

function CreateGameController() {}

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

CreateGameController.prototype.invitePlayer = function (fromClient, toClient) {
    this.transmitter.send(toClient.connection_id, events.invite_player, {
        from: fromClient
    });
};

CreateGameController.prototype.rejectPlayer = function () {

};

CreateGameController.prototype.successPlayer = function () {

};

CreateGameController.prototype.getName = function () {
    return constants.CREATE_GAME_CONTROLLER;
};

CreateGameController.prototype.postConstructor = function(ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};


module.exports = {
    class: CreateGameController
};