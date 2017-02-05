'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = req('server/constants/db');
var IOC = req('server/constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var logger = req('server/logging/logger').create('AuthDBManager');
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
