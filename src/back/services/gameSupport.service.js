'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var funcUtils = require('../utils/function-utils');
var creationUtils = req('src/back/utils/creation-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = req('src/js/logger').create('GameSupportService');
var errorLog = funcUtils.error(logger);

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
    var client = creationUtils.newClient(message.client.getId(), getRandomAnimal(), getRandomColor());
    this.clientsDBManager
        .save(client)
        .then(function (data) {
            return inst.clientsDBManager.getByCriteria({_id: data});
        })
        .then(this.notifyAboutNewClient.bind(this))
        .then(message.callback)
        .catch(errorLog);
};

GameSupportService.prototype.onDisconnect = function (message) {
    var inst = this;
    var connectionId = message[0];
    var disconnectedClient;
    this.clientsDBManager
        .getClientByConnectionId(connectionId)
        .then(function (client) {
            disconnectedClient = client;
            disconnectedClient.connection_id = null;
            inst.clientsDBManager.save(disconnectedClient);
            return inst.gameDBManager.getActiveGame(client._id);
        })
        .then(function(game) {
            if (game) {
                let opponentId = game.from.equal(disconnectedClient._id) ? game.to : game.from;
                inst.notifyOpponentAboutDisconnect(disconnectedClient, opponentId);
            } else {
                inst.cachedNetworkStatusesDBManager.updateStatus(disconnectedClient._id);
            }
        });
};

GameSupportService.prototype.onReconnect = function (message) {
    var inst = this;
    if (message.data) {
        return inst.clientsDBManager
            .get(message.data._id)
            .then(function (client) {
                if (client) {
                    //TODO notify about connection status
                    return inst.saveNewConnectionId(client, message.client.getId())
                        .then(function () {});
                }
                logger.warn('Client with id "%s" didn\'t exist. Save as new.', message.data._id);
                return inst.saveNewClientConnectionId(message.data, message.client.getId());
            })
            .then(message.callback)
            .catch(errorLog);
    }
    return new Promise(function (resolve) {
        resolve({});
    });
};

GameSupportService.prototype.saveNewConnectionId = function (client, connectionId) {
    var inst = this;
    client.connection_id = connectionId;
    return this.clientsDBManager
        .save(client, {_id: client._id})
        .then(function () {
            return inst.clientsDBManager.get(client._id);
        });
};

GameSupportService.prototype.saveNewClientConnectionId = function (client, connectionId) {
    var inst = this;
    client.connection_id = connectionId;
    delete client._id;
    return inst.clientsDBManager
        .save(client)
        .then(function () {
            return inst.clientsDBManager.getClientByConnectionId(client.connection_id);
        });
};

GameSupportService.prototype.notifyOpponentAboutDisconnect = function (disconnectedClient, opponentId) {
    var inst = this;
    return this.clientsDBManager
        .get(opponentId)
        .then(function (opponent) {
            inst.gameSupportController.notifyAboutDisconnect([opponent], disconnectedClient._id);
        })
        .catch(errorLog);
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
    this.gameSupportController.onDisconnect(this.onDisconnect.bind(this));
    this.cachedNetworkStatusesDBManager = ioc[constants.CACHED_NETWORK_STATUSES_DB_MANAGER];
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
};

module.exports = {
    class: GameSupportService
};
