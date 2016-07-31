var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants');

function CreateGameDBManager() {
}

CreateGameDBManager.prototype = Object.create(GenericDBManager.prototype);
CreateGameDBManager.prototype.constructor = CreateGameDBManager;

CreateGameDBManager.prototype.getCollectionName = function () {
    return this.collectionName;
};

CreateGameDBManager.prototype.getName = function () {
    return constants.CREATE_GAME_DB_MANAGER;
};

CreateGameDBManager.prototype.createInvite = function (fromClient, toClient, status) {
    var data = {
        from: fromClient,
        to: toClient,
        status: status,
        timestamp: Date.now()
    };
    return this.save(data);
};

CreateGameDBManager.prototype.getInvite = function (fromClientId, toClientId, inviteStatus) {
    var criteria = {
        'from._id' : this._getObjectId(fromClientId),
        'to._id': this._getObjectId(toClientId),
        status: inviteStatus
    };
    return this.getByCriteria(criteria).then(function(invite) {
        return invite;
    });
};

CreateGameDBManager.prototype.deleteInvite = function () {

};

CreateGameDBManager.prototype.postConstructor = function () {
    this.collectionName = constants.DB_COLLECTION_CREATE_GAME;
};

module.exports = {
    class: CreateGameDBManager
};