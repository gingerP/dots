'use strict';

const Promise = require('bluebird');
const logger = require('server/logging/logger').create('GameService');
const GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
const Errors = require('../errors');
const Constants = require('../utils/constants');
const GameActions = Constants.GAME_ACTIONS;
const GameStatuses = Constants.GAME_STATUSES;

function isOfferDrawForbidden(game, userId) {
    return game.actions[GameActions.GAVE_UP] || game.actions[GameActions.COMPLETE]
        || game.actions[GameActions.DRAW] && !userId.equals(game.actions[GameActions.DRAW]);
}

function isOfferCompleteForbidden(game, userId) {
    return game.actions[GameActions.GAVE_UP] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.COMPLETE] && !userId.equals(game.actions[GameActions.COMPLETE]);
}

function isGaveUpForbidden(game, userId) {
    return game.actions[GameActions.COMPLETE] || game.actions[GameActions.DRAW]
        || game.actions[GameActions.GAVE_UP] && !userId.equals(game.actions[GameActions.GAVE_UP]);
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
        if (!game) {
            throw new Errors.GameNotFoundError();
        }
        game.actions = game.actions || {};
        if (action === GameActions.DRAW) {
            if (isOfferDrawForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
            }
        } else if (action === GameActions.COMPLETE) {
            if (isOfferCompleteForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
        } else if (action === GameActions.GAVE_UP) {
            if (isGaveUpForbidden(game, initiator._id)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
        }
        const shouldNotify = !game.actions[action];
        game.actions[action] = initiator._id;

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
        let respondent = message.user;
        const game = await this.gameDb.getActiveGame(respondent._id);
        if (!game) {
            throw new Errors.GameNotFoundError();
        }
        const initiatorId = game.from.equals(respondent._id) ? game.to : game.from;
        let initiator = await this.usersDb.get(initiatorId);
        if (action === GameActions.DRAW) {
            if (isOfferDrawForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferDrawNotAllowed();
            }
        } else if (action === GameActions.COMPLETE) {
            if (isOfferCompleteForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
        } else if (action === GameActions.GAVE_UP) {
            if (isGaveUpForbidden(game, initiatorId)) {
                throw new Errors.GameActionOfferCompleteNotAllowed();
            }
        }
        [initiator, respondent] = await this.handleReply(isSuccess, game, initiator, respondent, action);
        message.callback(respondent);
        await this.gameCancelCtlr.notifyCancelReply(initiatorId, action, isSuccess, initiator.rating);
    }

    async handleReply(isSuccess, game, initiator, respondent, action) {
        if (!isSuccess) {
            delete game.actions[GameActions.GAVE_UP];
            await this.gameDb.save(game);
            return [initiator, respondent];
        }
        game.status = GameStatuses.FINISHED;
        game.activePlayer = null;
        await this.gameDb.save(game);
        const ratings = await this.userRatingService.calculateRatings(game, initiator, respondent, action);
        initiator.rating += ratings.initiator;
        respondent.rating += ratings.respondent;
        return await Promise.all([this.usersDb.save(initiator), this.usersDb.save(respondent)]);
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
