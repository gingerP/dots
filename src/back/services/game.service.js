'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var _ = require('lodash');
var funcUtils = _req('src/back/utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = _req('src/js/logger').create('GameService');
var Promise = require('q');
var errorLog = funcUtils.error(logger);
var graphLoop = _req('src/back/libs/graph/graph-loops-flood-fill');

function mergeClients(to, from) {
    var id = to._id;
    to = _.assignIn(to, from);
    to._id = id;
    return to;
}

function getRandomAnimal() {
    var randomIndex = Math.round((Math.random() * animals.length - 1));
    return animals[randomIndex];
}

function getRandomColor() {
    var randomIndex = Math.round((Math.random() * colors.length - 1));
    return colors[randomIndex];
}

function isGameAndClientValid(game, client) {
    return Boolean(game) && Boolean(client) && (client._id.equals(game.from) || client._id.equals(game.to));
}

function GameService() {
}

GameService.prototype = Object.create(GenericService.prototype);
GameService.prototype.constructor = GameService;

GameService.prototype.onAddDot = function (message) {
    var inst = this;
    var gameId = message.data.extend.gameId;
    var clientConnectionId = message.client.getId();
    var dot = {
        x: message.data.extend.xInd,
        y: message.data.extend.yInd
    };

    Promise.all([
        this.clientsDBManager.getClientByConnectionId(clientConnectionId),
        this.gameDBManager.get(gameId)
    ]).then(function (data) {
        var client = data[0];
        var game = data[1];
        if (isGameAndClientValid(game, client)) {
            inst.gameHistoryDBManager.addRecord(dot, client._id, game._id);
            inst.loopsDBManager.getLoops(gameId, client._id).then();


        }
    }).catch(errorLog);
};

GameService.prototype.getName = function () {
    return constants.GAME_SERVICE;
};

GameService.prototype.postConstructor = function (ioc) {
    this.gameController = ioc[constants.GAME_CONTROLLER];
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    this.gameHistoryDBManager = ioc[constants.GAME_HISTORY_DB_MANAGER];
    this.gameController.onAddDot(this.onAddDot.bind(this));
    this.loopsDBManager = ioc[constants.LOOPS_DB_MANAGER];
};

module.exports = {
    class: GameService
};

