var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var inviteStatuses = require('../constants/invite-statuses.json');
var funcUtils = _req('src/back/utils/function-utils');
var uuid = require('uuid');
var _ = require('lodash');
var Promise = require('q');
var logger = _req('src/js/logger').create('CreateGameService');
var gameStatuses = require('../constants/game-statuses');

function CreateGameService() {
}

CreateGameService.prototype = Object.create(GenericService.prototype);
CreateGameService.prototype.constructor = CreateGameService;

CreateGameService.prototype.onInvite = function (message) {
    var clientId;
    var inst = this;
    if (message.data.clients && message.data.clients.length) {
        clientId = message.data.clients[0];
        this.clientsDBManager.getClientsPair(clientId, message.client.getId()).then(function (clients) {
            var to = clients[0];
            var from = clients[1];
            var isActive = true;
            if (!_.isEmpty(to) && !_.isEmpty(from)) {
                inst.createGameDBManager.createInvite(from, to, inviteStatuses.active);
                inst.controller.invitePlayer(from, to);
            } else {
                logger.warn("Invite - client does not exist!");
            }
        }).catch(funcUtils.error(logger));
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
    }).catch(funcUtils.error(logger));
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
            inst.newGame(answer.fromClient, answer.toClient, answer.invite).then(function(game) {
                inst.controller.successPlayer(answer.fromClient, answer.toClient, game);
            });
        } else {
            inst.controller.successPlayerBeLate(answer.fromClient, answer.toClient);
        }
    }).catch(funcUtils.error(logger));
};

CreateGameService.prototype.onCancelGame = function(message) {
    var clientId;
    var connectionId;
    if (message.data && message.data.clients && message.data.clients.length) {
        clientId = message.data.clients[0];
        connectionId = message.client.getId();
        this.clientsDBManager.getClientsPair(clientId, connectionId).then(this.cancelGame.bind(this)).catch(funcUtils.error(logger));
    }
};

CreateGameService.prototype.newGame = function(clientA, clientB, invite) {
    var inst = this;
    return this.gameService.newGame(clientA._id, clientB._id).then(function(gameId) {
        invite.game = gameId;
        inst.createGameDBManager.save(invite);
        return inst.gameDBManager.get(gameId);
    }).catch(funcUtils.error(logger));
};

CreateGameService.prototype.cancelGame = function(clients) {
    var inst = this;
    return this.gameDBManager.getGame(clients[0]._id, clients[1]._id).then(function(game) {
        var gameCopy;
        if (game) {
            if (game.status === gameStatuses.closed) {
                logger.warn('CancelGame: Game found for %s and %s clients ONLY in status \'closed\'', clients[0]._id, clients[1]._id);
            } else {
                game.status = gameStatuses.closed;
                gameCopy = _.cloneDeep(game);
                inst.gameDBManager.save(game);
            }
            inst.controller.cancelGame(clients, gameCopy);
        } else {
            logger.error('No game found for %s and %s clients', clients[0]._id, clients[1]._id);
        }
    }).catch(funcUtils.error(logger));
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
            }).catch(funcUtils.error(logger));
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

    this.controller.onInvitePlayer(this.onInvite.bind(this));
    this.controller.onRejectPlayer(this.onReject.bind(this));
    this.controller.onSuccessPlayer(this.onSuccess.bind(this));
    this.controller.onCancelGame(this.onCancelGame.bind(this));

    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.createGameDBManager = ioc[constants.CREATE_GAME_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
};

module.exports = {
    class: CreateGameService
};