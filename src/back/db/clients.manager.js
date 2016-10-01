'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');
var funcUtils = require('../utils/function-utils');
var logger = req('src/js/logger').create('ClientsDBManager');

function ClientsDBManager() {
    this.collectionName = constants.DB_COLLECTION_CLIENTS;
}

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
    return this.getByCriteria({connection_id: connectionId}).catch(funcUtils.error(logger));
};


ClientsDBManager.prototype.getName = function() {
    return constants.CLIENTS_DB_MANAGER;
};

ClientsDBManager.prototype.getClientsPair = function(clientId, connectionId) {
    var inst = this;
    return Promise.all([
        inst.getClient(clientId),                            //To
        inst.getClientByConnectionId(connectionId)           //From
    ]);
};

ClientsDBManager.prototype.postConstructor = function() {
};

module.exports = {
    class: ClientsDBManager
};