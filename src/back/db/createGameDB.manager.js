var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');

function CreateGameDBManager() {
    this.collectionName = constants.DB_COLLECTION_CREATE_GAME;
}

CreateGameDBManager.prototype = Object.create(GenericDBManager.prototype);
CreateGameDBManager.prototype.constructor = CreateGameDBManager;

CreateGameDBManager.prototype.getName = function () {
    return constants.CREATE_GAME_DB_MANAGER;
};

CreateGameDBManager.prototype.createInvite = function (fromClient, toClient, status) {
    var data = {
        from: fromClient._id,
        to: toClient._id,
        status: status,
        timestamp: Date.now()
    };
    return this.save(data);
};

CreateGameDBManager.prototype.getInvite = function (fromClientId, toClientId, inviteStatus) {
    var criteria = {
        from : this._getObjectId(fromClientId),
        to: this._getObjectId(toClientId),
        status: inviteStatus
    };
    return this.getByCriteria(criteria).then(function(invite) {
        return invite;
    });
};

CreateGameDBManager.prototype.deleteInvite = function () {

};

CreateGameDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: CreateGameDBManager
};