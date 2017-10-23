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

function isOfferDrawAllowed(actions = []) {
	return !actions.length || _.every(actions, action => [GameActions.CANCEL, GameActions.GAVE_UP].indexOf(action.type) < 0)
}

class GameCancelService extends GenericService {

    /**
	 *
     * @param {SocketMessage} message
     * @returns {Promise.<void>}
     */
	async onCancel(message) {
		const action = message.data.action;
		const user = message.user;
		const game = await this.gameDb.getActiveGame(user._id);
		if (!game) {
			throw new Errors.GameNotFoundError();
		}
		if (action === GameActions.DRAW) {
            return this.onDraw(game, message);
		} else if (action === GameActions.COMPLETE) {

		} else if (action === GameActions.GAVE_UP) {

		}


	}

	async onDraw(game, message) {
		const user = message.user;

        if (game.actions && (game.actions[GameActions.GAVE_UP] || game.actions[GameActions.COMPLETE])) {
            throw new Errors.GameActionOfferDrawNotAllowed();
        }

        if (_.isNil(message.data.success)) {
            if (game.actions && game.actions[GameActions.DRAW] && !user._id.equals(game.actions[GameActions.DRAW])) {
                throw new Errors.GameActionOfferDrawNotAllowed();
            }
            game.actions = game.actions || {};
            game.actions[GameActions.DRAW] = user._id;
            await this.gameDb.save(game);
            message.callback();
            const opponentId = game.from.equals(user._id) ? game.to : game.from;
            this.gameCancelController.offerDraw(opponentId);
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
		this.gameCancelController = ioc[IOC.CONTROLLER.GAME_CANCEL];
		this.usersDb = ioc[IOC.DB_MANAGER.CLIENTS];
		this.gameDb = ioc[IOC.DB_MANAGER.GAME];
		this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
		this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
		this.gameCancelController.onCancel(this.onCancel.bind(this));
	}
}

module.exports = {
	class: GameCancelService
};

