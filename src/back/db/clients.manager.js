'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');
var funcUtils = require('../utils/function-utils');
var logger = req('src/js/logger').create('ClientsDBManager');
var errorLogger = funcUtils.error(logger);

function ClientsDBManager() {
    this.collectionName = constants.DB_COLLECTION_CLIENTS;
}

ClientsDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientsDBManager.prototype.constructor = ClientsDBManager;

ClientsDBManager.prototype.getClient = function (id) {
    if (id) {
        return this.get(id);
    }
    return funcUtils.emptyPromise({});
};

ClientsDBManager.prototype.getClientByConnectionId = function (connectionId) {
    return this.getByCriteria({connection_id: connectionId}).catch(errorLogger);
};

ClientsDBManager.prototype.getClientsExcept = function (client) {
    return this.listByCriteria({
        _id: {
            $ne: this.getObjectId(client._id)
        }
    }).catch(errorLogger);
};

ClientsDBManager.prototype.getOnlineClients = function () {
    return this.listByCriteria({isOnline: true}).catch(errorLogger);
};

ClientsDBManager.prototype.getName = function () {
    return constants.CLIENTS_DB_MANAGER;
};

ClientsDBManager.prototype.getClientsPair = function (clientId, connectionId) {
    var inst = this;
    return Promise.all([
        inst.getClient(clientId),                            //To
        inst.getClientByConnectionId(connectionId)           //From
    ]);
};

ClientsDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: ClientsDBManager
};