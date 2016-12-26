'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = req('server/constants/db');
var IOC = req('server/constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var logger = req('server/logging/logger').create('LoopsDBManager');
var errorLog = funcUtils.error(logger);
function LoopsDBManager() {
    this.collectionName = DB.COLLECTION.LOOPS;
}

LoopsDBManager.prototype = Object.create(GenericDBManager.prototype);
LoopsDBManager.prototype.constructor = LoopsDBManager;

LoopsDBManager.prototype.getName = function () {
    return IOC.DB_MANAGER.LOOPS;
};

LoopsDBManager.prototype.saveLoops = function (loops, gameId, clientId) {
    return this.save({
        client: clientId,
        game: gameId,
        loops: loops
    }).catch(errorLog);
};

LoopsDBManager.prototype.getLoops = function (gameId) {
    return this.getByCriteria({
        game: this.getObjectId(gameId),
        client: this.getObjectId(gameId)
    }).catch(errorLog);
};

LoopsDBManager.prototype.postConstructor = function () {
};

module.exports = {
    class: LoopsDBManager
};
