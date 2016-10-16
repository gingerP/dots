'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');

function GameDataDBManager() {
    this.collectionName = constants.DB_COLLECTION_GAME_DATA;
}

GameDataDBManager.prototype = Object.create(GenericDBManager.prototype);
GameDataDBManager.prototype.constructor = GameDataDBManager;

GameDataDBManager.prototype.getName = function () {
    return constants.GAME_DATA_DB_MANAGER;
};


GameDataDBManager.prototype.createNew = function (gameId, clientId, dots, trappedDots, loops) {
    return this.save({
        game: this.getObjectId(gameId),
        client: this.getObjectId(clientId),
        dots: dots || [],
        trappedDots: trappedDots || [],
        loops: loops || []
    });
};

GameDataDBManager.prototype.saveGameData = function (/*id, dots, trappedDots, loops*/) {
};

GameDataDBManager.prototype.getGameData = function (gameId, clientId) {
    return this.getByCriteria({
        game: this.getObjectId(gameId),
        client: this.getObjectId(clientId)
    });
};

GameDataDBManager.prototype.addDot = function (dot, clientId, gameId) {
    return this.getByCriteria({
        client: this.getObjectId(clientId),
        game: this.getObjectId(gameId)
    }).then(function (/*gameData*/) {
        /*if (gameData) {}*/
    });
};

GameDataDBManager.prototype.getGameDataForGame = function (gameId) {
    return this.listByCriteria({
        game: this.getObjectId(gameId)
    });
};

GameDataDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: GameDataDBManager
};
