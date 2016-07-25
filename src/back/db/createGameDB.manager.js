var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants');

function CreateGameDBManager() {}

CreateGameDBManager.prototype = Object.create(GenericDBManager.prototype);
CreateGameDBManager.prototype.constructor = CreateGameDBManager;

CreateGameDBManager.prototype.getCollectionName = function() {
    return this.collectionName;
};

CreateGameDBManager.prototype.getName = function() {
    return constants.CREATE_GAME_DB_MANAGER;
};

CreateGameDBManager.prototype.postConstructor = function() {
    this.collectionName = constants.DB_COLLECTION_CREATE_GAME;
};

module.exports = {
    class: CreateGameDBManager
};