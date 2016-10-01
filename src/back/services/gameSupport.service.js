'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var _ = require('lodash');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = req('src/js/logger').create('GameSupportService');
var errorLog = funcUtils.error(logger);

function mergeClients(to, from) {
    var id = to._id;
    var toPrepared = _.assignIn(to, from);
    toPrepared._id = id;
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

function GameSupportService() {
}

GameSupportService.prototype = Object.create(GenericService.prototype);
GameSupportService.prototype.constructor = GameSupportService;

GameSupportService.prototype.onNewClient = function (message) {
    var inst = this;
    var now = Date.now();
    var client = {
        connection_id: message.client.getId(),
        created: now,
        updated: now,
        name: getRandomAnimal(),
        color: getRandomColor()
    };
    this.clientsDBManager.save(client).then(function (data) {
        inst.clientsDBManager.getByCriteria({_id: data}).then(message.callback);
    }).catch(errorLog);
};

GameSupportService.prototype.onReconnect = function (message) {
    var inst = this;
    var clientObj;
    if (message.data) {
        inst.clientsDBManager.getByCriteria({connection_id: message.data.connection_id}).then(function (client) {
            client = client || {};
            message.data.connection_id = message.client.getId();
            client = mergeClients(client, message.data);
            clientObj = _.cloneDeep(client);
            return inst.clientsDBManager.saveByCriteria(client, {_id: client._id});
        }).then(function () {
            message.callback(clientObj);
        }).catch(errorLog);
    } else {
        return new Promise(function (resolve) {
            resolve({});
        });
    }
};

GameSupportService.prototype.newGame = function (clientAId, clientBId) {
    return this.gameDBManager.createGame(clientAId, clientBId, gameStatuses.active);
};

GameSupportService.prototype.getName = function () {
    return constants.GAME_SUPPORT_SERVICE;
};

GameSupportService.prototype.postConstructor = function (ioc) {
    this.gameSupportController = ioc[constants.GAME_SUPPORT_CONTROLLER];
    this.gameSupportController.onNewClient(this.onNewClient.bind(this));
    this.gameSupportController.onReconnect(this.onReconnect.bind(this));
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
};

module.exports = {
    class: GameSupportService
};
