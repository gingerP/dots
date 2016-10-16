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
    this.clientsDBManager
        .save(client)
        .then(function (data) {
            return inst.clientsDBManager.getByCriteria({_id: data});
        })
        .then(this.notifyAboutNewClient.bind(this))
        .then(message.callback)
        .catch(errorLog);
};

GameSupportService.prototype.onReconnect = function (message) {
    var inst = this;
    var preparedClient;
    if (message.data) {
        return inst.clientsDBManager
            .get(message.data._id)
            .then(function (client) {
                if (client) {
                    preparedClient = client;
                    preparedClient.connection_id = message.client.getId();
                    return inst.clientsDBManager
                        .saveByCriteria(preparedClient, {_id: preparedClient._id})
                        .then(function() {
                            return inst.clientsDBManager.get(preparedClient._id)
                        });
                }

                logger.warn('Client with id "%s" didn\'t exist. Save as new.', message.data._id);
                preparedClient = message.data;
                preparedClient.connection_id = message.client.getId();
                delete preparedClient._id;
                return inst.clientsDBManager
                    .save(preparedClient)
                    .then(function() {
                        return inst.clientsDBManager.getClientByConnectionId(preparedClient.connection_id);
                    });
            })
            .then(message.callback)
            .catch(errorLog);
    }
    return new Promise(function (resolve) {
        resolve({});
    });
};

GameSupportService.prototype.notifyAboutNewClient = function (newClient) {
    var inst = this;
    this.clientsDBManager
        .getClientsExcept(newClient)
        .then(function (clients) {
            if (clients && clients.length) {
                inst.gameSupportController.notifyAboutNewClient(newClient, clients);
            }
        })
        .catch(errorLog);
    return newClient;
};

GameSupportService.prototype.newGame = function (clientAId, clientBId, activePlayerId) {
    return this.gameDBManager.createGame(clientAId, clientBId, activePlayerId, gameStatuses.active);
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
