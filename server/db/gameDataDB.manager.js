'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = req('server/constants/db');
var IOC = req('server/constants/ioc.constants');
var CreationUtils = req('server/utils/creation-utils');

function GameDataDBManager() {
    this.collectionName = DB.COLLECTION.GAME_DATA;
}

GameDataDBManager.prototype = Object.create(GenericDBManager.prototype);
GameDataDBManager.prototype.constructor = GameDataDBManager;

GameDataDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.GAME_DATA;
};

GameDataDBManager.prototype.createNew = function createNew(gameId, clientId, color, dots, trappedDots, loops) {
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
