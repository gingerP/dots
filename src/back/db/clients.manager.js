var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants');

function ClientsDBManager() {}

ClientsDBManager.prototype = Object.create(GenericDBManager.prototype);
ClientsDBManager.prototype.constructor = ClientsDBManager;

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