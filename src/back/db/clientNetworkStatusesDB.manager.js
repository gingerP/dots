'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');
var funcUtils = require('../utils/function-utils');
var logger = req('src/js/logger').create('ClientNetworkStatusesDBManager');
var errroLog = funcUtils.error(logger);

function ClientNetworkStatusesDBManager() {
    this.collectionName = constants.DB_COLLECTION_CACHED_NETWORK_STATUSES;
}

ClientNetworkStatusesDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientNetworkStatusesDBManager.prototype.constructor = ClientNetworkStatusesDBManager;

ClientNetworkStatusesDBManager.prototype.updateStatus = function (clientId, connectionId) {
    var preparedClienId = this.getObjectId(clientId);
    return this.saveByCriteria({
        client_id: preparedClienId,
        connection_id: connectionId
    }, {
        client_id: preparedClienId
    }).catch(errroLog);
};

ClientNetworkStatusesDBManager.prototype.getName = function () {
    return constants.DB_COLLECTION_CACHED_NETWORK_STATUSES;
};

ClientNetworkStatusesDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: ClientNetworkStatusesDBManager
};
