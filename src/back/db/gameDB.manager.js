var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');

function GameDBManager() {
}

GameDBManager.prototype = Object.create(GenericDBManager.prototype);
GameDBManager.prototype.constructor = GameDBManager;

GameDBManager.prototype.getCollectionName = function () {
    return this.collectionName;
};

GameDBManager.prototype.getName = function () {
    return constants.GAME_DB_MANAGER;
};

GameDBManager.prototype.createGame = function (fromClientId, toClientId, status) {
    var data = {
        from: fromClientId,
        to: toClientId,
        status: status,
        timestamp: Date.now()
    };
    return this.save(data);
};

GameDBManager.prototype.getGame = function (clientA, clientB, status) {
    var criteria = {
        $or: [
            {
                $and: [
                    {from: clientA},
                    {to: clientB}
                ]
            },
            {
                $and: [
                    {from: clientA},
                    {to: clientB}
                ]
            }

        ],
        status: status
    };
    return this.getByCriteria(criteria);
};

GameDBManager.prototype.deleteInvite = function () {

};

GameDBManager.prototype.postConstructor = function () {
    this.collectionName = constants.DB_COLLECTION_GAMES;
};

module.exports = {
    class: GameDBManager
};