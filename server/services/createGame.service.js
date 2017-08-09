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

function getRandomColorsPair() {
    var random = CommonUtils.getRandomArbitrary(0, 1);
    return [
        COLORS[random],
        COLORS[random ? 0 : 1]
    ];
}

class CreateGameService extends GenericService {

    async onInvite(message) {
        try {
            if (message.data.clients && message.data.clients.length) {
                const inst = this;
                const clientId = message.data.clients[0];
                const clientsIds = [clientId, sessionUtils.getClientId(message.client.getSession())];
                const clients = await inst.clientsDBManager.get(clientsIds);

                for (let cIndex = 0; cIndex < clients.length; cIndex++) {
                    const to = getClient(clientsIds[0], clients);
                    const from = getClient(clientsIds[1], clients);
                    if (!_.isEmpty(to) && !_.isEmpty(from)) {
                        await inst.createGameDBManager.createInvite(from, to, inviteStatuses.active);
                        await inst.controller.invitePlayer(from, to);
                    } else {
                        logger.warn('Invite - client does not exist!');
                    }
                }
            }
        } catch (error) {
            errorLog(error);
        }
    }

    async onReject(message) {
        const inst = this;
        try {
            const answer = await inst.giveAnAnswerToClient(message);
            if (!answer) {
                return;
            }
            if (answer.isInviteExist) {
                answer.invite.status = inviteStatuses.denied;
                await inst.createGameDBManager.save(answer.invite);
                await inst.controller.rejectPlayer(answer.fromClient, answer.toClient);
            } else {
                await inst.controller.rejectPlayerBeLate(answer.fromClient, answer.toClient);
            }
        } catch (e) {
            errorLog(e);
        }
    }

    async onSuccess(message) {
        var inst = this;
        try {
            const answer = await inst.giveAnAnswerToClient(message);
            if (!answer) {
                return;
            }
            if (answer.isInviteExist) {
                answer.invite.status = inviteStatuses.successful;
                await inst.createGameDBManager.save(answer.invite);
                const gameDetails = await inst.newGame(answer.fromClient, answer.toClient, answer.fromClient, answer.invite);
                await inst.controller.successPlayer(
                    answer.fromClient,
                    answer.toClient,
                    gameDetails.game,
                    gameDetails.gameDataFrom,
                    gameDetails.gameDataTo
                );
            } else {
                await inst.controller.successPlayerBeLate(answer.fromClient, answer.toClient);
            }
        } catch (e) {
            errorLog(e);
        }
    }

    async onCancelGame(message) {
        const inst = this;
        try {
            const gameId = _.get(message, 'data.extend.gameId');
            if (gameId) {
                let clientId = sessionUtils.getClientId(message.client.getSession());
                const [game, client] = await Promise.all([
                    this.gameDBManager.get(gameId),
                    this.clientsDBManager.get(clientId)
                ]);

                if (game.from.equals(client._id) || game.to.equals(client._id)) {
                    let opponentId = game.from.equals(client._id) ? game.to : game.from;
                    message.callback(true);
                    const opponent = await inst.clientsDBManager.get(opponentId);
                    await inst.cancelGame([opponent, client], game);
                } else {
                    message.callback(Errors.noAccess);
                }
            } else {
                logger.error('onCancelGame: gameId empty!');
            }
        } catch (e) {
            errorLog(e);
        }
    }

    async newGame(clientFrom, clientTo, activePlayer, invite) {
        const inst = this;
        try {

            const game = await this.gameSupportService.newGame(clientFrom._id, clientTo._id, activePlayer._id);
            invite.game = game._id;
            await inst.createGameDBManager.save(invite);
            const colors = getRandomColorsPair();
            const [gameDataFrom, gameDataTo] = await Promise.all([
                inst.gameDataDBManager.createNew(game._id, clientFrom._id, colors[0]),
                inst.gameDataDBManager.createNew(game._id, clientTo._id, colors[1])
            ]);
            return {
                gameDataFrom: gameData[0],
                gameDataTo: gameData[1],
                game: game
            };
        } catch(e) {
            errorLog(e);
        }
    }


    async cancelGameById(id) {
        const inst = this;
        const game = await inst.gameDBManager.get(id);
        if (game) {
            if (game.status === gameStatuses.closed) {
                logger.warn('CancelGameById: Game found in status \'closed\'');
            } else {
                game.status = gameStatuses.closed;
                await inst.gameDBManager.save(game);
            }
        } else {
            logger.warn('No game found for id %s and %s clients', id);
        }
    }

    cancelGame(clients, game) {
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
    }

    async giveAnAnswerToClient(message) {
        const inst = this;
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
    }

    getName() {
        return IOC.SERVICE.CREATE_GAME;
    }

    postConstructor(ioc) {
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
    }
}

module.exports = {
    class: CreateGameService
};
