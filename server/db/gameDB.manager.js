var GenericDBManager = require('./genericDB.manager').class;
var DB = require('server/constants/db');
var IOC = require('server/constants/ioc.constants');
var gameStatuses = require('../constants/game-statuses');

function GameSupportDBManager() {
    this.collectionName = DB.COLLECTION.GAMES;
}

GameSupportDBManager.prototype = Object.create(GenericDBManager.prototype);
GameSupportDBManager.prototype.constructor = GameSupportDBManager;

GameSupportDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.GAME;
};

GameSupportDBManager.prototype.createGame = function (fromClientId, toClientId, activePlayerId, status) {
    var data = {
        from: fromClientId,
        to: toClientId,
        activePlayer: activePlayerId,
        status: status,
        timestamp: Date.now()
    };
    return this.save(data);
};

GameSupportDBManager.prototype.getActiveGame = function (clientId) {
    var preparedClientId = this.getObjectId(clientId);
    var criteria = {
        $or: [
            {
                from: preparedClientId
            },
            {
                to: preparedClientId
            }
        ],
        status: gameStatuses.active
    };
    return this.getByCriteria(criteria);
};

GameSupportDBManager.prototype.getGame = function (clientAId, clientBId, status) {
    var clientAIdDB = this.getObjectId(clientAId);
    var clientBIdDB = this.getObjectId(clientBId);

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
        criteria.status = status;
    }
    return this.getByCriteria(criteria);
};

GameSupportDBManager.prototype.getGameByClientsByGameId = function(clientAId, clientBId, gameId) {
    var clientAIdDB = this.getObjectId(clientAId);
    var clientBIdDB = this.getObjectId(clientBId);
    var gameIdDB = this.getObjectId(gameId);

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

GameSupportDBManager.prototype.getGamesForClient = function getGamesForClient(clientId) {
    return this.listByCriteria({
        $or: [
            {
                from: this.getObjectId(clientId)
            },
            {
                to: this.getObjectId(clientId)
            }
        ],
        status: 'closed'
    });
};

GameSupportDBManager.prototype.deleteInvite = function () {

};

GameSupportDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: GameSupportDBManager
};
