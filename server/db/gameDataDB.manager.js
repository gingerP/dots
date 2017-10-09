'use strict';

var _ = require('lodash');
var GenericDBManager = require('./genericDB.manager').class;
var DB = require('server/constants/db');
var IOC = require('server/constants/ioc.constants');
var CreationUtils = require('server/utils/creation-utils');
var logger = require('server/logging/logger').create('GameDataDBManager');
var FuncUtils = require('server/utils/function-utils');
var errorLog = FuncUtils.error(logger);
var CommonUtils = require('server/utils/common-utils');

function GameDataDBManager() {
    this.collectionName = DB.COLLECTION.GAME_DATA;
}

GameDataDBManager.prototype = Object.create(GenericDBManager.prototype);
GameDataDBManager.prototype.constructor = GameDataDBManager;

GameDataDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.GAME_DATA;
};

GameDataDBManager.prototype.createNew = function createNew(gameId, clientId, color, dots, trappedDots, loops) {
    const newGameData = CreationUtils.newGameData(
        this.getObjectId(gameId),
        this.getObjectId(clientId),
        dots,
        [],
        loops,
        color
    );
    return this.save(newGameData);
};

GameDataDBManager.prototype.saveGameData = function saveGameData(/*id, dots, trappedDots, loops*/) {
};

GameDataDBManager.prototype.getGameData = function getGameData(gameId, clientId) {
    return this.getByCriteria({
        game: this.getObjectId(gameId),
        client: this.getObjectId(clientId)
    });
};

GameDataDBManager.prototype.addDot = function addDot(dot, clientId, gameId) {
    return this.getByCriteria({
        client: this.getObjectId(clientId),
        game: this.getObjectId(gameId)
    }).then(function (/*gameData*/) {
        /*if (gameData) {}*/
    });
};

/**
 *
 * @param {MongoId} gameId
 * @returns {Promise<GameData[]>}
 */
GameDataDBManager.prototype.getGameDataForGame = function getGameDataForGame(gameId) {
    if (_.isArray(gameId)) {
        return this.listByCriteria({
            game: this.getObjectId(gameId)
        });
    } else {
        return this.listByCriteria({
            game: this.getObjectId(gameId)
        });
    }
};

GameDataDBManager.prototype.getGamesDataForClient = function getGamesHistoryForClient(clientId) {
    return this.listByCriteria({
        client: this.getObjectId(clientId)
    });
};

GameDataDBManager.prototype.getAggregatedGameData = function loadGameData(clientsIds) {
    const COLLECTION_NAME = this.collectionName;
    var config = [
        {
            $match: {
                client: _.map(CommonUtils.createArray(clientsIds), this.getObjectId)
            }
        },
        {
            $project: {
                client: true,
                game: true,
                color: true,
                loops: true,
                dots: {
                    $size: '$dots'
                },
                losingDots: {
                    $size: '$losingDots'
                }
            }
        }
    ];

    function extractData(db) {
        return new Promise((resolve, reject) => {
            db[COLLECTION_NAME].aggregate(config, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(prepareAggregatedGameData(result));
                }
            });
        });
    }

    return this.exec().then(extractData).catch(errorLog);
};

GameDataDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: GameDataDBManager
};
