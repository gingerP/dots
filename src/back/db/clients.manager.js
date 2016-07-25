var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants');
var funcUtils = require('../utils/function-utils');

function ClientsDBManager() {}

ClientsDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientsDBManager.prototype.constructor = ClientsDBManager;

ClientsDBManager.prototype.getClient = function(id) {
    if (id) {
        return this.get(id);
    } else {
        return funcUtils.emptyPromise({});
    }
};

ClientsDBManager.prototype.getClientByConnectionId = function(connectionId) {
    if (connectionId) {
        return this.getByCriteria({connection_id: connectionId});
    } else {
        return funcUtils.emptyPromise({});
    }
};


ClientsDBManager.prototype.getCollectionName = function() {
    return this.collectionName;
};

ClientsDBManager.prototype.getName = function() {
    return constants.CLIENTS_DB_MANAGER;
};

ClientsDBManager.prototype.postConstructor = function() {
  this.collectionName = constants.DB_COLLECTION_CLIENTS;
};

module.exports = {
    class: ClientsDBManager
};