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

class GameService extends GenericService {

	/**
	 *
	 * @param {SocketMessage} message
	 * @throws [GameNotFoundError, ClientNotFoundError, GameNotActiveError, ClientNotBelongToGameError, DotAlreadyExistsError, DotNotAllowed]
	 */
	async onAddDot(message) {
		const inst = this;
		const gameId = message.data.gameId;
		const clientId = sessionUtils.getClientId(message.client.getSession());
		const dot = {x: message.data.x, y: message.data.y};

		let [client, game] = await Promise.all([
			this.clientsDBManager.get(clientId),
			this.gameDBManager.get(gameId)
		]);

		if (_.isNil(game)) {
			throw new Errors.GameNotFoundError();
		}

		if (_.isNil(client)) {
			throw new Errors.ClientNotFoundError();
		}

		if (game.status !== GameStatuses.active) {
			throw new Errors.GameNotActiveError();
		}

		if (!client._id.equals(game.from) && !client._id.equals(game.to)) {
			throw new Errors.ClientNotBelongToGameError();
		}

		const opponentId = game.to.equals(client._id) ? game.from : game.to;
		const [activePlayerGameData, opponentGameData, opponent] = await Promise.all([
			this.gameDataDBManager.getGameData(gameId, client._id),
			this.gameDataDBManager.getGameData(gameId, opponentId),
			this.clientsDBManager.get(opponentId)
		]);
		const [activePlayerCache, opponentCache] = await this.gameDataCacheDBManager.getCacheByGameDataId(
			activePlayerGameData._id,
			opponentGameData._id
		);

		let isDotNew = !_.some(activePlayerGameData.dots, clientDot => clientDot.x === dot.x && clientDot.y === dot.y);
		isDotNew = isDotNew && !_.some(opponentGameData.dots, clientDot => clientDot.x === dot.x && clientDot.y === dot.y);

		if (!isDotNew) {
			throw new Errors.DotAlreadyExistsError();
		}

		const {active: [activePlayerDelta], opponent: [opponentDelta]} = await GameScoreUtils.getGamersScoresV2(
			dot,
			activePlayerGameData, activePlayerCache,
			opponentGameData, opponentCache
		);

		await Promise.all([
			this.gameDataCacheDBManager.save(activePlayerCache),
			this.gameDataCacheDBManager.save(opponentCache),
			this.gameDataDBManager.save(activePlayerGameData),
			this.gameDataDBManager.save(opponentGameData)
		]);

		game.activePlayer = opponent._id;
		game = await inst.gameDBManager.save(game);

		await inst.gameController.nextStep(
			dot,
			client, activePlayerGameData, activePlayerDelta,
			opponent, opponentGameData, opponentDelta,
			game
		);
		message.callback();
	}

	getName() {
		return IOC.SERVICE.GAME;
	}

	postConstructor(ioc) {
		this.gameController = ioc[IOC.CONTROLLER.GAME];
		this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
		this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
		this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
		this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
		this.gameController.onAddDot(this.onAddDot.bind(this));
		this.loopsDBManager = ioc[IOC.DB_MANAGER.LOOPS];
	}
}

module.exports = {
	class: GameService
};

