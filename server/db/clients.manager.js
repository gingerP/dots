'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = require('../constants/db');
var IOC = require('../constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var logger = require('server/logging/logger').create('ClientsDBManager');
var errorLogger = funcUtils.error(logger);
var Promise = require('bluebird');

function ClientsDBManager() {
    this.collectionName = DB.COLLECTION.CLIENTS;
}

ClientsDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientsDBManager.prototype.constructor = ClientsDBManager;

ClientsDBManager.prototype.getClient = function (id) {
    if (id) {
        return this.get(id).then((client) => {
            if (client.auth) {
                delete client.auth.token;
            }
            return client;
        });
    }
    return funcUtils.emptyPromise({});
};

ClientsDBManager.prototype.getClientByConnectionId = function (connectionId) {
    return this.getByCriteria({connection_id: connectionId});
};

ClientsDBManager.prototype.getClientsExcept = function (client) {
    return this.listByCriteria({
        _id: {
            $ne: this.getObjectId(client._id)
        }
    });
};

ClientsDBManager.prototype.getOnlineClients = function () {
    return this.listByCriteria({isOnline: true});
};

ClientsDBManager.prototype.getClientsPair = function (clientId, connectionId) {
    return Promise.all([
        this.getClient(clientId),                            //To
        this.getClientByConnectionId(connectionId)           //From
    ]);
};

ClientsDBManager.prototype.getByAuthIdType = function (authId, type) {
    return this.getByCriteria({
        'auth.id': authId,
        'auth.type': type
    })
};

ClientsDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.CLIENTS;
};

ClientsDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: ClientsDBManager
};