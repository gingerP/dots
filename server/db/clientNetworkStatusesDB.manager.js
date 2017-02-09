'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = require('../constants/db');
var IOC = require('../constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var logger = require('server/logging/logger').create('ClientNetworkStatusesDBManager');
var errroLog = funcUtils.error(logger);

function ClientNetworkStatusesDBManager() {
    this.collectionName = DB.COLLECTION.CACHED_NETWORK_STATUSES;
}

ClientNetworkStatusesDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientNetworkStatusesDBManager.prototype.constructor = ClientNetworkStatusesDBManager;

ClientNetworkStatusesDBManager.prototype.updateStatus = function (clientId, connectionId) {
    var preparedClientId = this.getObjectId(clientId);
    return this.saveByCriteria({
        client_id: preparedClientId,
        connection_id: connectionId
    }, {
        client_id: preparedClientId
    }).catch(errroLog);
};

ClientNetworkStatusesDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.CACHED_NETWORK_STATUSES;
};

ClientNetworkStatusesDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: ClientNetworkStatusesDBManager
};
