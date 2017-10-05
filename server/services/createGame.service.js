'use strict';

const GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
const InviteStatuses = require('../constants/invite-statuses.json');
const funcUtils = require('server/utils/function-utils');
const sessionUtils = require('server/utils/session-utils');
const CommonUtils = require('server/utils/common-utils');
const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('server/logging/logger').create('CreateGameService');
const GameStatuses = require('../constants/game-statuses');
const errorLog = funcUtils.error(logger);
const Errors = require('server/errors/index');
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
        const inst = this;
        const clientIdTo = message.data.clientId;
        const clientIdFrom = sessionUtils.getClientId(message.client.getSession());
        const [clientTo, clientFrom] = await Promise.all([
            inst.clientsDBManager.get(clientIdTo),
            inst.clientsDBManager.get(clientIdFrom)
        ]);
        if (!clientTo) {
            throw new Errors.ClientNotFoundError(`Client(${clientIdTo}) not found.`);
        }

        await inst.createGameDBManager.createInvite(clientFrom, clientTo, InviteStatuses.active);
        await inst.controller.invitePlayer(clientFrom, clientTo);
    }

    async onReject(message) {
        const inst = this;
        const answer = await inst.giveAnAnswerToClient(message);
        if (!answer) {
            return;
        }
        if (answer.isInviteExist) {
            answer.invite.status = InviteStatuses.denied;
            await inst.createGameDBManager.save(answer.invite);
            await inst.controller.rejectPlayer(answer.fromClient, answer.toClient);
        } else {
            await inst.controller.rejectPlayerBeLate(answer.fromClient, answer.toClient);
        }
    }

    async onSuccess(message) {
        const answer = await this.giveAnAnswerToClient(message);
        if (!answer) {
            return;
        }
        if (answer.isInviteExist) {
            answer.invite.status = InviteStatuses.successful;
            await this.createGameDBManager.save(answer.invite);
            const gameDetails = await this.newGame(answer.fromClient, answer.toClient, answer.fromClient, answer.invite);
            await this.controller.successPlayer(
                answer.fromClient,
                answer.toClient,
                gameDetails.game,
                gameDetails.gameDataFrom,
                gameDetails.gameDataTo
            );
        } else {
            await this.controller.successPlayerBeLate(answer.fromClient, answer.toClient);
        }
    }

    async onCancelGame(message) {
        const gameId = message.data.gameId;
        let clientId = sessionUtils.getClientId(message.client.getSession());
        const [game, client] = await Promise.all([
            this.gameDBManager.get(gameId),
            this.clientsDBManager.get(clientId)
        ]);
        if (!game.from.equals(client._id) && !game.to.equals(client._id)) {
            throw new Errors.CouldNotCancelGameError();
        }

        let opponentId = game.from.equals(client._id) ? game.to : game.from;
        const opponent = await this.clientsDBManager.get(opponentId);
        await this.cancelGame([opponent, client], game);
    }

    async newGame(clientFrom, clientTo, activePlayer, invite) {
        const inst = this;
        const game = await this.gameSupportService.newGame(clientFrom._id, clientTo._id, activePlayer._id);
        invite.game = game._id;
        await inst.createGameDBManager.save(invite);
        const colors = getRandomColorsPair();
        const [gameDataFrom, gameDataTo] = await Promise.all([
            inst.gameDataDBManager.createNew(game._id, clientFrom._id, colors[0]),
            inst.gameDataDBManager.createNew(game._id, clientTo._id, colors[1]),
        ]);
        await Promise.all([
            inst.gameDataCacheDBManager.createNew(gameDataFrom._id),
            inst.gameDataCacheDBManager.createNew(gameDataTo._id)
        ]);
        return {
            gameDataFrom: gameDataFrom,
            gameDataTo: gameDataTo,
            game: game
        };
    }


    async cancelGameById(gameId) {
        const inst = this;
        const game = await inst.gameDBManager.get(gameId);
        if (!game) {
            throw new Errors.GameNotFoundError(`Game(${gameId}) not found.`)
        }
        if (game.status !== GameStatuses.closed) {
            game.status = GameStatuses.closed;
            await inst.gameDBManager.save(game);
        }
    }

    async cancelGame(clients, game) {
        if (game.status !== GameStatuses.closed) {
            game.status = GameStatuses.closed;
            game = await this.gameDBManager.save(game);
        }
        return this.controller.cancelGame(clients, game);
    }

    async giveAnAnswerToClient(message) {
        const clientId = message.data.clientId;
        const toClientId = sessionUtils.getClientId(message.client.getSession());
        const [clientFrom, clientTo] = await this.clientsDBManager.get([clientId, toClientId]);
        const invite = await this.createGameDBManager.getInvite(clientFrom._id, clientTo._id, InviteStatuses.active);
        return {
            isInviteExist: Boolean(invite),
            invite: invite,
            fromClient: clientFrom,
            toClient: clientTo
        };
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
        this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
    }
}

module.exports = {
    class: CreateGameService
};
