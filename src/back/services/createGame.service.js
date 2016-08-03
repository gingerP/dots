var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var inviteStatuses = require('../constants/invite-statuses.json');
var funcUtils = require('../utils/function-utils');
var uuid = require('uuid');
var _ = require('lodash');
var Promise = require('q');
var logger = _req('src/js/logger').create('CreateGameService');

function CreateGameService() {
}

CreateGameService.prototype = Object.create(GenericService.prototype);
CreateGameService.prototype.constructor = CreateGameService;

CreateGameService.prototype.onInvite = function (message) {
    var clientId;
    var inst = this;
    if (message.data.clients && message.data.clients.length) {
        clientId = message.data.clients[0];
        this.getClientsPair(clientId, message.client.getId()).then(function (clients) {
            var to = clients[0];
            var from = clients[1];
            var isActive = true;
            if (!_.isEmpty(to) && !_.isEmpty(from)) {
                inst.createGameDBManager.createInvite(from, to, inviteStatuses.active);
                inst.controller.invitePlayer(from, to);
            } else {
                logger.warn("Invite - client does not exist!");
            }
        });
    }
};

CreateGameService.prototype.onReject = function (message) {
    var inst = this;
    inst.giveAnAnswerToClient(message).then(function (answer) {
        if (!answer) {
            return;
        }
        if (answer.isInviteExist) {
            answer.invite.status = inviteStatuses.denied;
            inst.createGameDBManager.save(answer.invite);
            inst.controller.rejectPlayer(answer.fromClient, answer.toClient);
        } else {
            inst.controller.rejectPlayerBeLate(answer.fromClient, answer.toClient);
        }
    });
};

CreateGameService.prototype.onSuccess = function (message) {
    var inst = this;
    inst.giveAnAnswerToClient(message).then(function (answer) {
        if (!answer) {
            return;
        }
        if (answer.isInviteExist) {
            answer.invite.status = inviteStatuses.successful;
            inst.createGameDBManager.save(answer.invite);
            inst.newGame(answer.fromClient, answer.toClient, answer.invite).then(function(gameId) {
                inst.controller.successPlayer(answer.fromClient, answer.toClient, gameId);
            });
        } else {
            inst.controller.successPlayerBeLate(answer.fromClient, answer.toClient);
        }
    });
};

CreateGameService.prototype.newGame = function(clientA, clientB, invite) {
    var inst = this;
    return this.gameService.newGame(clientA._id, clientB._id).then(function(gameId) {
        invite.game = gameId;
        inst.createGameDBManager.save(invite);
        return gameId;
    });
};

CreateGameService.prototype.giveAnAnswerToClient = function(message) {
    var inst = this;
    var clientId;
    var connectionId;
    var fromClient;
    var toClient;
    if (message.data && message.data.clients.length) {
        clientId = message.data.clients[0];
        connectionId = message.client.getId();
        return this.clientsDBManager.getClientsPair(clientId, connectionId)
            .then(function (clients) {
                fromClient = clients[0];
                toClient = clients[1];
                return inst.createGameDBManager.getInvite(fromClient._id, toClient._id, inviteStatuses.active);
            })
            .then(function(invite) {
                return {
                    isInviteExist: Boolean(invite),
                    invite: invite,
                    fromClient: fromClient,
                    toClient: toClient
                }
            });
    } else {
        logger.error('Incorrect data while give answer to client!');
        return Promise();
    }
};

CreateGameService.prototype.getName = function () {
    return constants.CREATE_GAME_SERVICE;
};

CreateGameService.prototype.postConstructor = function (ioc) {
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
    this.gameService = ioc[constants.GAME_SERVICE];
    this.controller = ioc[constants.CREATE_GAME_CONTROLLER];

    this.controller.onInvitePlayer(funcUtils.wrapListener(this, this.onInvite));
    this.controller.onRejectPlayer(funcUtils.wrapListener(this, this.onReject));
    this.controller.onSuccessPlayer(funcUtils.wrapListener(this, this.onSuccess));

    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.createGameDBManager = ioc[constants.CREATE_GAME_DB_MANAGER];
};

module.exports = {
    class: CreateGameService
};