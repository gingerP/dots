var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');

function GameSupportDBManager() {
}

GameSupportDBManager.prototype = Object.create(GenericDBManager.prototype);
GameSupportDBManager.prototype.constructor = GameSupportDBManager;

GameSupportDBManager.prototype.getCollectionName = function () {
    return this.collectionName;
};

GameSupportDBManager.prototype.getName = function () {
    return constants.GAME_DB_MANAGER;
};

GameSupportDBManager.prototype.createGame = function (fromClientId, toClientId, status) {
    var data = {
        from: fromClientId,
        to: toClientId,
        status: status,
        timestamp: Date.now()
    };
    return this.save(data);
};

GameSupportDBManager.prototype.getGame = function (clientAId, clientBId, status) {
    var clientAIdDB = this._getObjectId(clientAId);
    var clientBIdDB = this._getObjectId(clientBId);

    var criteria = {
        $or: [
            {
                from: clientAIdDB,
                to: clientBIdDB
            },
            {
                from: clientBIdDB,
                to: clientAIdDB
            }

        ]
    };
    if (status) {
        criteria.status = status
    }
    return this.getByCriteria(criteria);
};

GameSupportDBManager.prototype.getGameByClientsByGameId = function(clientAId, clientBId, gameId) {
    var clientAIdDB = this._getObjectId(clientAId);
    var clientBIdDB = this._getObjectId(clientBId);
    var gameIdDB = this._getObjectId(gameId);

    var criteria = {
        _id: gameIdDB,
        $or: [
            {
                from: clientAIdDB,
                to: clientBIdDB
            },
            {
                from: clientBIdDB,
                to: clientAIdDB
            }

        ]
    };
    return this.getByCriteria(criteria);
};

GameSupportDBManager.prototype.deleteInvite = function () {

};

GameSupportDBManager.prototype.postConstructor = function () {
    this.collectionName = constants.DB_COLLECTION_GAMES;
};

module.exports = {
    class: GameSupportDBManager
};