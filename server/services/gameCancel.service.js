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

function isOfferDrawForbidden(game, user) {
	return game.actions && (game.actions[GameActions.GAVE_UP] || game.actions[GameActions.COMPLETE]
        || game.actions[GameActions.DRAW] && !user._id.equals(game.actions[GameActions.DRAW]));
}

function isOfferCompleteForbidden(game, user) {
    return game.actions && (game.actions[GameActions.GAVE_UP] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.COMPLETE] && !user._id.equals(game.actions[GameActions.COMPLETE]));
}

function isGaveUpForbidden(game, user) {
    return game.actions && (game.actions[GameActions.COMPLETE] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.GAVE_UP] && !user._id.equals(game.actions[GameActions.GAVE_UP]));
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

            if (isOfferDrawForbidden(game, initiator)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
			}
            game.actions = game.actions || {};
			shouldNotify = !game.actions[GameActions.DRAW];

            game.actions[GameActions.DRAW] = initiator._id;

		} else if (action === GameActions.COMPLETE) {

            if (isOfferCompleteForbidden(game, initiator)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
			}
            game.actions = game.actions || {};
            shouldNotify = !game.actions[GameActions.COMPLETE];
            game.actions[GameActions.COMPLETE] = initiator._id;

		} else if (action === GameActions.GAVE_UP) {

            if (isGaveUpForbidden(game, initiator)) {
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
        const user = message.user;
        const game = await this.gameDb.getActiveGame(user._id);
        if (!game) {
            throw new Errors.GameNotFoundError();
        }
        const initiatorId = game.from.equals(user._id) ? game.to : game.from;
        const initiator = await this.usersDb.get(initiatorId);
        if (action === GameActions.DRAW) {

            if (isOfferDrawForbidden(game, initiator)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
            }
            if (!isSuccess) {
            	delete game.actions[GameActions.DRAW];
                await this.gameDb.save(game);
                message.callback();
                this.gameCancelCtlr.offerDraw();
			} else {
                this.userRatingService.updateRatings();
            }

        } else if (action === GameActions.COMPLETE) {

            if (isOfferCompleteForbidden(game, initiator)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
            if (!isSuccess) {
                delete game.actions[GameActions.COMPLETE];
            } else {
                this.userRatingService.updateRatings();
            }

        } else if (action === GameActions.GAVE_UP) {

            if (isGaveUpForbidden(game, initiator)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
            if (!isSuccess) {
                delete game.actions[GameActions.GAVE_UP];
            } else {
                this.userRatingService.updateRatings();
			}

        }
	}

	async onDraw(game, message) {
		const user = message.user;


        if (_.isNil(message.data.success)) {

        } else {
            const isSuccess = message.data.success;
        	const opponentId = game.from.equals(user._id) ? game.to : game.from;
        	if (!opponentId.equals(game.actions[GameActions.GAVE_UP])) {
        		throw new Errors.GameActionOfferDrawNotAllowed();
			}

			if (isSuccess) {
        		game.status = GameStatuses.FINISHED;
				const opponent = await this.usersDb.get(opponentId);
				this.userRatingService.updateRatings(user, opponent, game);
				await Promise.all([
					this.usersDb.save(user),
					this.usersDb.save(opponent),
					this.gameDb.save(game)
				]);
			}
		}
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

