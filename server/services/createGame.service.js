'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var inviteStatuses = require('../constants/invite-statuses.json');
var funcUtils = req('server/utils/function-utils');
var sessionUtils = req('server/utils/session-utils');
var _ = require('lodash');
var Promise = require('q');
var logger = req('server/logging/logger').create('CreateGameService');
var gameStatuses = require('../constants/game-statuses');
var errorLog = funcUtils.error(logger);
const Errors = req('server/modules/Errors');

function getClient(id, clients) {
    var prepareId = _.isString(id) ? id : id.toString();
    return _.find(clients, function(client) {
        return client._id.toString() === prepareId;
    });
}

function CreateGameService() {
}

CreateGameService.prototype = Object.create(GenericService.prototype);
CreateGameService.prototype.constructor = CreateGameService;

CreateGameService.prototype.onInvite = function (message) {
    var clientId;
    var inst = this;
    var clientsIds;

    function handleGamers(gamers) {
        var to = getClient(clientsIds[0], gamers);
        var from = getClient(clientsIds[1], gamers);
        if (!_.isEmpty(to) && !_.isEmpty(from)) {
            inst.createGameDBManager.createInvite(from, to, inviteStatuses.active);
            inst.controller.invitePlayer(from, to);
        } else {
            logger.warn('Invite - client does not exist!');
        }
    }

    if (message.data.clients && message.data.clients.length) {
        clientId = message.data.clients[0];
        clientsIds = [clientId, sessionUtils.getClientId(message.client)];
        this.clientsDBManager.get(clientsIds)
            .then(handleGamers)
            .catch(errorLog);
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
    }).catch(errorLog);
};

CreateGameService.prototype.onSuccess = function (message) {
    var inst = this;

    function handleSuccessGame(answer) {
        if (!answer) {
            return;
        }
        if (answer.isInviteExist) {
            answer.invite.status = inviteStatuses.successful;
            inst.createGameDBManager.save(answer.invite);
            inst.newGame(answer.fromClient, answer.toClient, answer.fromClient, answer.invite).then(function (game) {
                inst.controller.successPlayer(answer.fromClient, answer.toClient, game);
            });
        } else {
            inst.controller.successPlayerBeLate(answer.fromClient, answer.toClient);
        }
    }

    return inst.giveAnAnswerToClient(message)
        .then(handleSuccessGame)
        .catch(errorLog);
};

CreateGameService.prototype.onCancelGame = function (message) {
    var inst = this;
    var gameId = _.get(message, 'data.extend.gameId');

    function cancelGame(data) {
        var game = data[0];
        var client = data[1];
        if (game.from.equals(client._id) || game.to.equals(client._id)) {
            let opponentId = game.from.equals(client._id) ? game.to : game.from;
            message.callback(true);
            inst.clientsDBManager.get(opponentId).then(function (opponent) {
                inst.cancelGame([opponent, client], game);
            });
        } else {
            message.callback(Errors.noAccess);
            errorLog(Errors.noAccess);
        }
    }

    if (gameId) {
        let clientId = sessionUtils.getClientId(message.client);
        Promise.all([
            this.gameDBManager.get(gameId),
            this.clientsDBManager.get(clientId)
        ]).then(cancelGame)
        .catch(errorLog);
    } else {
        logger.error('onCancelGame: gameId empty!');
    }
};

CreateGameService.prototype.newGame = function (clientA, clientB, activePlayer, invite) {
    var inst = this;

    function handleNewGame(gameId) {
        invite.game = gameId;
        inst.createGameDBManager.save(invite);
        inst.gameDataDBManager.createNew(gameId, clientA._id);
        inst.gameDataDBManager.createNew(gameId, clientB._id);
        return inst.gameDBManager.get(gameId);
    }

    return this.gameSupportService
        .newGame(clientA._id, clientB._id, activePlayer._id)
        .then(handleNewGame)
        .catch(errorLog);
};

CreateGameService.prototype.cancelGameById = function (id) {
    var inst = this;
    return this.gameDBManager.get(id).then(function (game) {
        if (game) {
            if (game.status === gameStatuses.closed) {
                logger.warn('CancelGameById: Game found in status \'closed\'');
            } else {
                game.status = gameStatuses.closed;
                inst.gameDBManager.save(game);
            }
        } else {
            logger.warn('No game found for id %s and %s clients', id);
        }
    }).catch(errorLog);
};

CreateGameService.prototype.cancelGame = function (clients, game) {
    var inst = this;
    var gameCopy;
    if (game.status === gameStatuses.closed) {
        logger.warn('CancelGame: Game found for %s and %s clients ONLY in status \'closed\'',
            clients[0]._id,
            clients[1]._id
        );
        gameCopy = game;
    } else {
        game.status = gameStatuses.closed;
        gameCopy = _.cloneDeep(game);
        inst.gameDBManager.save(game);
    }
    inst.controller.cancelGame(clients, gameCopy);
};

CreateGameService.prototype.giveAnAnswerToClient = function (message) {
    var inst = this;
    var clientId;
    var toClientId;
    var fromClient;
    var toClient;

    function newAnswer(invite) {
        return {
            isInviteExist: Boolean(invite),
            invite: invite,
            fromClient: fromClient,
            toClient: toClient
        };
    }

    function getInvite(clients) {
        fromClient = getClient(clientId, clients);
        toClient = getClient(toClientId, clients);
        return inst.createGameDBManager.getInvite(fromClient._id, toClient._id, inviteStatuses.active);
    }

    if (message.data && message.data.clients.length) {
        clientId = message.data.clients[0];
        toClientId = sessionUtils.getClientId(message.client);
        return this.clientsDBManager.get([clientId, toClientId])
            .then(getInvite)
            .then(newAnswer)
            .catch(errorLog);
    }
    logger.error('Incorrect data while give answer to client!');
    return Promise();
};

CreateGameService.prototype.getName = function () {
    return constants.CREATE_GAME_SERVICE;
};

CreateGameService.prototype.postConstructor = function (ioc) {
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
    this.gameSupportService = ioc[constants.GAME_SUPPORT_SERVICE];
    this.controller = ioc[constants.CREATE_GAME_CONTROLLER];

    this.controller.onInvitePlayer(this.onInvite.bind(this));
    this.controller.onRejectPlayer(this.onReject.bind(this));
    this.controller.onSuccessPlayer(this.onSuccess.bind(this));
    this.controller.onCancelGame(this.onCancelGame.bind(this));

    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.createGameDBManager = ioc[constants.CREATE_GAME_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    this.gameDataDBManager = ioc[constants.GAME_DATA_DB_MANAGER];
};

module.exports = {
    class: CreateGameService
};
