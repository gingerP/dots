'use strict';

const GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
const inviteStatuses = require('../constants/invite-statuses.json');
const funcUtils = require('server/utils/function-utils');
const sessionUtils = require('server/utils/session-utils');
const CommonUtils = require('server/utils/common-utils');
const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('server/logging/logger').create('CreateGameService');
const gameStatuses = require('../constants/game-statuses');
const errorLog = funcUtils.error(logger);
const Errors = require('server/modules/Errors');
const COLORS = require('server/constants/colors');

function getClient(id, clients) {
    var prepareId = _.isString(id) ? id : id.toString();
    return _.find(clients, function (client) {
        return client._id.toString() === prepareId;
    });
}

function CreateGameService() {
}

function getRandomColorsPair() {
    var random = CommonUtils.getRandomArbitrary(0, 1);
    return [
        COLORS[random],
        COLORS[random ? 0 : 1]
    ];
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
        clientsIds = [clientId, sessionUtils.getClientId(message.client.getSession())];
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
            inst.newGame(answer.fromClient, answer.toClient, answer.fromClient, answer.invite)
                .then(function (gameDetails) {
                    inst.controller.successPlayer(
                        answer.fromClient,
                        answer.toClient,
                        gameDetails.game,
                        gameDetails.gameDataFrom,
                        gameDetails.gameDataTo
                    );
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
        let clientId = sessionUtils.getClientId(message.client.getSession());
        Promise.all([
            this.gameDBManager.get(gameId),
            this.clientsDBManager.get(clientId)
        ]).then(cancelGame)
            .catch(errorLog);
    } else {
        logger.error('onCancelGame: gameId empty!');
    }
};

CreateGameService.prototype.newGame = function (clientFrom, clientTo, activePlayer, invite) {
    var inst = this;

    function saveInvite(game) {
        invite.game = game._id;
        return inst.createGameDBManager
            .save(invite)
            .then(() => game);
    }

    function createGameData(game) {
        var colors = getRandomColorsPair();
        return Promise.all([
            inst.gameDataDBManager.createNew(game._id, clientFrom._id, colors[0]),
            inst.gameDataDBManager.createNew(game._id, clientTo._id, colors[1])
        ]).then((gameData) => {
            return {
                gameDataFrom: gameData[0],
                gameDataTo: gameData[1],
                game: game
            };
        });
    }

    return this.gameSupportService
        .newGame(clientFrom._id, clientTo._id, activePlayer._id)
        .then(saveInvite)
        .then(createGameData)
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
        toClientId = sessionUtils.getClientId(message.client.getSession());
        return this.clientsDBManager.get([clientId, toClientId])
            .then(getInvite)
            .then(newAnswer)
            .catch(errorLog);
    }
    logger.error('Incorrect data while give answer to client!');
    return Promise();
};

CreateGameService.prototype.getName = function () {
    return IOC.SERVICE.CREATE_GAME;
};

CreateGameService.prototype.postConstructor = function (ioc) {
    this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
    this.gameSupportService = ioc[IOC.SERVICE.GAME_SUPPORT];
    this.controller = ioc[IOC.CONTROLLER.CREATE_GAME];

    this.controller.onInvitePlayer(this.onInvite.bind(this));
    this.controller.onRejectPlayer(this.onReject.bind(this));
    this.controller.onSuccessPlayer(this.onSuccess.bind(this));
    this.controller.onCancelGame(this.onCancelGame.bind(this));

    this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
    this.createGameDBManager = ioc[IOC.DB_MANAGER.CREATE_GAME];
    this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
    this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
};

module.exports = {
    class: CreateGameService
};
