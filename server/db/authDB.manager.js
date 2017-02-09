'use strict';

var GenericDBManager = require('server/db/genericDB.manager').class;
var DB = require('server/constants/db');
var IOC = require('server/constants/ioc.constants');
var funcUtils = require('server/utils/function-utils');
var logger = require('server/logging/logger').create('AuthDBManager');
var errorLog = funcUtils.error(logger);

function AuthDBManager() {
    this.collectionName = DB.COLLECTION.AUTH;
}

AuthDBManager.prototype = Object.create(GenericDBManager.prototype);
AuthDBManager.prototype.constructor = AuthDBManager;

AuthDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.AUTH;
};

AuthDBManager.prototype.getByAuthIdType = function (authId, type) {
    return this.getByCriteria({
        auth_id: authId,
        type: type
    }).catch(errorLog);
};

AuthDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: AuthDBManager
};
