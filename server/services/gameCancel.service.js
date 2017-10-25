'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('server/logging/logger').create('GameService');
const GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
const GameScoreUtils = require('server/services/helpers/game-score/game-score-utils');
const CreationUtils = require('server/utils/creation-utils');
const sessionUtils = require('server/utils/session-utils');
const GameStatuses = require('../constants/game-statuses.json');
const Errors = require('../errors');
const Constants = require('../utils/constants');
const GameActions = Constants.GAME_ACTIONS;
const GameStatuses = Constants.GAME_STATUSES;

function isOfferDrawForbidden(game, userId) {
	return game.actions && (game.actions[GameActions.GAVE_UP] || game.actions[GameActions.COMPLETE]
        || game.actions[GameActions.DRAW] && !userId.equals(game.actions[GameActions.DRAW]));
}

function isOfferCompleteForbidden(game, userId) {
    return game.actions && (game.actions[GameActions.GAVE_UP] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.COMPLETE] && !userId.equals(game.actions[GameActions.COMPLETE]));
}

function isGaveUpForbidden(game, userId) {
    return game.actions && (game.actions[GameActions.COMPLETE] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.GAVE_UP] && !userId.equals(game.actions[GameActions.GAVE_UP]));
}

class GameCancelService extends GenericService {

    /**
	 *
     * @param {SocketMessage} message
     * @returns {Promise.<void>}
     */
	async onCancel(message) {
		const action = message.data.type;
		const initiator = message.user;
		const game = await this.gameDb.getActiveGame(initiator._id);
		let shouldNotify = true;
		if (!game) {
			throw new Errors.GameNotFoundError();
		}
		if (action === GameActions.DRAW) {

            if (isOfferDrawForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
			}
            game.actions = game.actions || {};
			shouldNotify = !game.actions[GameActions.DRAW];

            game.actions[GameActions.DRAW] = initiator._id;

		} else if (action === GameActions.COMPLETE) {

            if (isOfferCompleteForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
			}
            game.actions = game.actions || {};
            shouldNotify = !game.actions[GameActions.COMPLETE];
            game.actions[GameActions.COMPLETE] = initiator._id;

		} else if (action === GameActions.GAVE_UP) {

            if (isGaveUpForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
            game.actions = game.actions || {};
            shouldNotify = !game.actions[GameActions.GAVE_UP];
            game.actions[GameActions.GAVE_UP] = initiator._id;

        }

        await this.gameDb.save(game);
        message.callback();
        if (shouldNotify) {
            const opponentId = game.from.equals(user._id) ? game.to : game.from;
            this.gameCancelCtlr.offerDraw(opponentId);
        }
	}

    /**
	 *
     * @param {SocketMessage} message
     * @returns {Promise.<void>}
     */
	async onCancelReply(message) {
        const action = message.data.type;
        const isSuccess = message.data.success;
        const respondent = message.user;
        const game = await this.gameDb.getActiveGame(respondent._id);
        if (!game) {
            throw new Errors.GameNotFoundError();
        }
        const initiatorId = game.from.equals(respondent._id) ? game.to : game.from;
        const initiator = await this.usersDb.get(initiatorId);
        if (action === GameActions.DRAW) {

            if (isOfferDrawForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
            }
            await this.handleReply(isSuccess, game, initiator, respondent, action);
            message.callback();
            await this.gameCancelCtlr.notifyCancelReply(initiatorId, action, isSuccess);

        } else if (action === GameActions.COMPLETE) {

            if (isOfferCompleteForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
            await this.handleReply(isSuccess, game, initiator, respondent, action);
            message.callback();
            await this.gameCancelCtlr.notifyCancelReply(initiatorId, action, isSuccess);

        } else if (action === GameActions.GAVE_UP) {

            if (isGaveUpForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
            await this.handleReply(isSuccess, game, initiator, respondent, action);
            message.callback();
            await this.gameCancelCtlr.notifyCancelReply(initiatorId, action, isSuccess);

        }
	}

	async handleReply(isSuccess, game, initiator, respondent, action) {
        if (!isSuccess) {
            delete game.actions[GameActions.GAVE_UP];
            await this.gameDb.save(game);
        } else {
            await this.userRatingService.updateRatings(game, initiator, respondent, action);
            await this.cancelGame(game);
        }
	}

    async cancelGame(game) {
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

	getName() {
		return IOC.SERVICE.GAME;
	}

	postConstructor(ioc) {
		this.userRatingService = ioc[IOC.SERVICE.USER_RATING];
		this.gameCancelCtlr = ioc[IOC.CONTROLLER.GAME_CANCEL];
		this.usersDb = ioc[IOC.DB_MANAGER.CLIENTS];
		this.gameDb = ioc[IOC.DB_MANAGER.GAME];
		this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
		this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];

		this.gameCancelCtlr.onCancel(this.onCancel.bind(this));
        this.gameCancelCtlr.onCancelReply(this.onCancelReply.bind(this));
	}
}

module.exports = {
	class: GameCancelService
};

