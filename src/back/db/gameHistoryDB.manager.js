'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var constants = require('../constants/constants');

function GameHistoryDBManager() {}

GameHistoryDBManager.prototype = Object.create(GenericDBManager.prototype);
GameHistoryDBManager.prototype.constructor = GameHistoryDBManager;

GameHistoryDBManager.prototype.getCollectionName = function() {
    return constants.DB_COLLECTION_GAME_HISTORY;
};

GameHistoryDBManager.prototype.getName = function() {
    return constants.GAME_HISTORY_DB_MANAGER;
};

GameHistoryDBManager.prototype.postConstructor = function() {
};

GameHistoryDBManager.prototype.addRecord = function(dot, clientId, gameId) {
    return this.save({
        client: clientId,
        dot: dot,
        game: gameId
    });
};

GameHistoryDBManager.prototype.getHistory = function() {

};

module.exports = {
    class: GameHistoryDBManager
};