var GenericDBManager = require('./genericDB.manager').class;
var DB = req('server/constants/db');
var IOC = req('server/constants/ioc.constants');

function CreateGameDBManager() {
    this.collectionName = DB.COLLECTION.CREATE_GAME;
}

CreateGameDBManager.prototype = Object.create(GenericDBManager.prototype);
CreateGameDBManager.prototype.constructor = CreateGameDBManager;

CreateGameDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.CREATE_GAME;
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
        from: this.getObjectId(fromClientId),
        to: this.getObjectId(toClientId),
        status: inviteStatus
    };
    return this.getByCriteria(criteria).then(function (invite) {
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
