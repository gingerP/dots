'use strict';

const GenericDBManager = require('./genericDB.manager').class;
const DB = require('server/constants/db');
const IOC = require('server/constants/ioc.constants');
const CreationUtils = require('server/utils/creation-utils');
const logger = require('server/logging/logger').create('GameDataCacheDBManager');
const FuncUtils = require('server/utils/function-utils');
const errorLog = FuncUtils.error(logger);

function GameDataCacheDBManager() {
    this.collectionName = DB.COLLECTION.GAME_DATA_CACHE;
}

GameDataCacheDBManager.prototype = Object.create(GenericDBManager.prototype);
GameDataCacheDBManager.prototype.constructor = GameDataCacheDBManager;

GameDataCacheDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.GAME_DATA_CACHE;
};

GameDataCacheDBManager.prototype.createNew = function createNew(gameId, clientId, color, dots, trappedDots, loops) {
    var newGameData = CreationUtils.newGameData(
        this.getObjectId(gameId),
        this.getObjectId(clientId),
        dots,
        [],
        loops,
        color
    );
    return this.save(newGameData).then((id) => this.get(id));
};

GameDataCacheDBManager.prototype.saveCache = function saveCache(gameDataId, cache) {
    return this.saveByCriteria({
        gameDataId: this.getObjectId(gameDataId),
        cache: cache
    }, {
        gameDataId: this.getObjectId(gameDataId)
    });
};

GameDataCacheDBManager.prototype.getCacheByGameDataId = function saveCache(gameDataId) {
    return this.getByCriteria({
        gameDataId: gameDataId
    });
};

GameDataCacheDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: GameDataCacheDBManager
};
