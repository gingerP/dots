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

GameDBManager.prototype.getInvite = function (fromClientId, toClientId, inviteStatus) {
    var criteria = {
        from : this._getObjectId(fromClientId),
        to: this._getObjectId(toClientId),
        status: inviteStatus
    };
    return this.getByCriteria(criteria).then(function(invite) {
        return invite;
    });
};

GameDBManager.prototype.deleteInvite = function () {

};

GameDBManager.prototype.postConstructor = function () {
    this.collectionName = constants.DB_COLLECTION_GAMES;
};

module.exports = {
    class: GameDBManager
};