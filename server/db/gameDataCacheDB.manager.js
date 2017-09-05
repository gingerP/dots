'use strict';

const GenericDBManager = require('./genericDB.manager').class;
const DB = require('server/constants/db');
const IOC = require('server/constants/ioc.constants');
const CreationUtils = require('server/utils/creation-utils');
const logger = require('server/logging/logger').create('GameDataCacheDBManager');
const FuncUtils = require('server/utils/function-utils');
const errorLog = FuncUtils.error(logger);
const _ = require('lodash');

class GameDataCacheDBManager extends GenericDBManager {

    constructor() {
        super();
        this.collectionName = DB.COLLECTION.GAME_DATA_CACHE;
    }


    getName() {
        return IOC.DB_MANAGER.GAME_DATA_CACHE;
    }

    async createNew(gameId, clientId, color, dots, trappedDots, loops) {
        const newGameData = CreationUtils.newGameData(
            this.getObjectId(gameId),
            this.getObjectId(clientId),
            dots,
            [],
            loops,
            color
        );
        return this.save(newGameData);
    }

    async saveCache(gameDataId, cache) {
        return this.saveByCriteria({
            gameDataId: this.getObjectId(gameDataId),
            cache: cache
        }, {
            gameDataId: this.getObjectId(gameDataId)
        });
    }

    async getCacheByGameDataId(...gameDataIds) {
        const preparedIds = _.map(gameDataIds, id => this.getObjectId(id));
        if (gameDataIds.length === 1) {
            return this.getByCriteria({gameDataId: preparedIds[0]});
        } else {
            const caches = await this.getByCriteria({gameDataId: {$in: preparedIds}});
            return this.orderByIds('gameDataId', caches, gameDataIds);
        }
    };

    postConstructor() {
    }
}

module.exports = {
    class: GameDataCacheDBManager
};
