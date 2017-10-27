'use strict';

const GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
const funcUtils = require('../utils/function-utils');
const GameStatuses = require('../constants/game-statuses');
const Promise = require('bluebird');
const logger = require('server/logging/logger').create('GameDataService');
const errorLog = funcUtils.error(logger);
const escapeRegexp = require('escape-string-regexp');
const sessionUtils = require('server/utils/session-utils');
const Errors = require('../errors');
const _ = require('lodash');

class GameDataService extends GenericService {

    /**
     *
     * @param {SocketMessage} message
     * @returns {Promise.<*|Promise.<TResult>>}
     */
    async onGetClients(message) {
        const data = message.data;
        let excludeUsers = [];
        const options = {
            where: {},
            limit: [(data.page - 1) * data.pageSize, data.pageSize]
        };
        if (data.search) {
            options.where.name = {$regex: new RegExp('.*' + escapeRegexp(data.search) + '.*', 'gi')};
        }
        if (!_.isNil(data.isOnline)) {
            options.where.isOnline = {$eq: data.isOnline};
        }
        if (!_.isNil(data.excludeGameUsers) && data.excludeGameUsers) {
            const game = await this.gameDb.getByCriteria({
                $or: [{from: message.user._id}, {to: message.user._id}],
                status: GameStatuses.active
            });
            if (game) {
                excludeUsers = excludeUsers.concat([game.from, game.to]);
            }
        }
        if (!data.order) {
            options.order = {rating: -1};
        }
        if (message.user) {
            excludeUsers.push(message.user._id);
        }
        options.where._id = {$nin: excludeUsers};
        const [response, maxRating = 0] = await Promise.all([
            this.clientsDb.findAll(options),
            this.clientsDb.getMaxRating()
        ]);
        message.callback({
            meta: {
                totalCount: response.totalCount,
                page: data.page,
                pageSize: data.pageSize
            },
            maxRate: maxRating,
            list: response.list
        });
    }

    async onGetInvites(message) {
        const data = message.data;
        const userIds = await this.invitesDb.findAll({
            where: {to: message.user._id, status: GameStatuses.active},
            limit: [0, 5],
            distinct: 'to'
        });
        return this.clientsDb.findAll({where: {$in: userIds}});
    }

    /**
     *
     * @param {SocketMessage} message
     * @returns {Promise.<*|Promise.<TResult>>}
     */
    async onGetMySelf(message) {
        const clientId = sessionUtils.getClientId(message.client.getSession());
        return this.clientsDb.get(clientId).then(message.callback);
    };

    async onReject() {

    }

    async onSuccess() {

    }

    /**
     *
     * @param {MongoId} clientId - client id, whose history is loaded
     */

    async getClientHistory(clientId) {
        return this.clientHistory.aggregate(clientId);
    }

    /**
     *
     * @param {SocketMessage} message
     * @returns {Promise.<null>}
     */
    async onGetGameState(message) {
        const gameId = message.data.id;
        const cacheManager = this.gameDataCacheDBManager;
        const [game, usersGameDataList] = await Promise.all([
            this.gameDb.get(gameId),
            this.gameDataDBManager.getGameDataForGame(gameId),
        ]);
        if (!game) {
            throw new Errors.GameNotFoundError();
        }
        const gameDataIds = _.map(usersGameDataList, '_id');
        let [gameDataCacheList, users] = await Promise.all([
            cacheManager.getCacheByGameDataId.apply(cacheManager, gameDataIds),
            this.clientsDb.get([game.to, game.from])
        ]);

        users = _.map(users, (user) => {
            user.gameData = _.find(usersGameDataList, gameData => gameData.client.equals(user._id));
            const cache = _.find(gameDataCacheList, cache => cache.gameDataId.equals(user.gameData._id));
            user.capturedDots = _.reduce(cache.cache,
                (accumulator, loopCache) => {
                    accumulator.push.apply(accumulator, loopCache.capturedDots);
                    return accumulator;
                }, []
            );
            return user;
        });

        message.callback({
            game: game,
            clients: users
        });
    }

    async onIsGameClosed(message) {
        this.gameDb.get(message.data.id).then(function (game) {
            if (game) {
                message.callback(game.status === gameStatuses.closed);
            } else {
                message.callback(false);
            }
        }).catch(errorLog);
    }

    getName() {
        return IOC.SERVICE.GAME_DATA;
    }

    bindApi() {
        this.controller.onGetClientHistory(this.getClientHistory.bind(this));
        this.controller.onGetClientsList(this.onGetClients.bind(this));
        this.controller.onGetInvites(this.onGetInvites.bind(this));
        this.controller.onGetMyself(this.onGetMySelf.bind(this));
        this.controller.onIsGameClosed(this.onIsGameClosed.bind(this));
        this.controller.onGetGameState(this.onGetGameState.bind(this));
    }

    applyInjection(ioc) {
        this.gameSupportService = ioc[IOC.SERVICE.GAME_SUPPORT];
        this.controller = ioc[IOC.CONTROLLER.GAME_DATA];
        this.clientsDb = ioc[IOC.DB_MANAGER.CLIENTS];
        this.gameDb = ioc[IOC.DB_MANAGER.GAME];
        this.invitesDb = ioc[IOC.DB_MANAGER.CREATE_GAME];
        this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
        this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
        this.clientHistory = ioc[IOC.DB_MANAGER.CLIENTS_HISTORY_AGGREGATE];
    };

    postConstructor(ioc) {
        this.applyInjection(ioc);
        this.bindApi();
    }
}

module.exports = {
    class: GameDataService
};
