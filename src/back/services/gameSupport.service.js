'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var funcUtils = require('../utils/function-utils');
var creationUtils = req('src/back/utils/creation-utils');
var sessionUtils = req('src/back/utils/session-utils');
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

    function getClient(clientId) {
        return inst.clientsDBManager.get(clientId);
    }

    function notifyAboutNewClient(newClient) {
        return this.notifyAboutNewClient(newClient);
    }

    function storeClient(newClient) {
        sessionUtils.storeClientId(newClient._id, message.client);
        return newClient;
    }

    this.clientsDBManager
        .save(client)
        .then(getClient)
        .then(storeClient)
        .then(notifyAboutNewClient)
        .then(message.callback)
        .catch(errorLog);
};

GameSupportService.prototype.onDisconnect = function (message) {
    var inst = this;
    var connectionId = message[0];
    var disconnectedClientId;

    function saveConnectionId(client) {
        var disconnectedClient = client;
        disconnectedClientId = client._id;
        disconnectedClient.connection_id = null;
        return inst.clientsDBManager.save(disconnectedClient);
    }

    function handleConnectionNotification() {
        return inst.handleConnectionNotification(disconnectedClientId, connectionId);
    }

    return this.clientsDBManager
        .getClientByConnectionId(connectionId)
        .then(saveConnectionId)
        .then(handleConnectionNotification);
};

GameSupportService.prototype.onReconnect = function (message) {
    var inst = this;
    var reconnectedClientId = message.data._id;

    function handleConnectionNotification() {
      return inst.handleConnectionNotification(reconnectedClientId, message.client.getId());
    }

    function storeClient(newClient) {
        if (newClient) {
            sessionUtils.storeClientId(newClient._id, message.client);
        }
        return newClient;
    }

    if (message.data) {
        return inst.clientsDBManager
            .get(reconnectedClientId)
            .then(storeClient)
            .then(message.callback)
            .then(handleConnectionNotification)
            .catch(errorLog);
    }
    return new Promise(function (resolve) {
        resolve({});
    });
};

GameSupportService.prototype.handleConnectionNotification = function (clientId, connectionId) {
    var inst = this;

    function runNotification(game) {
        if (game) {
            let opponentId = game.from.equal(clientId) ? game.to : game.from;
            inst.notifyOpponentAboutNetworkStatusChange(clientId, opponentId, connectionId);
        } else {
            inst.cachedNetworkStatusesDBManager.updateStatus(clientId, connectionId);
        }
    }

    return inst.gameDBManager
        .getActiveGame(clientId)
        .then(runNotification);
};

GameSupportService.prototype.saveNewConnectionId = function (client, connectionId) {
    var inst = this;
    client.connection_id = connectionId;

    function getClient(clientId) {
        return inst.clientsDBManager.get(clientId);
    }

    return this.clientsDBManager
        .save(client, {_id: client._id})
        .then(getClient);
};

GameSupportService.prototype.saveNewClientConnectionId = function (client, connectionId) {
    var inst = this;
    client.connection_id = connectionId;
    delete client._id;

    function getClientByConnection() {
        return inst.clientsDBManager.getClientByConnectionId(client.connection_id);
    }

    return inst.clientsDBManager
        .save(client)
        .then(getClientByConnection);
};

GameSupportService.prototype.notifyOpponentAboutNetworkStatusChange =
    function (disconnectedClient, opponentId, connectionId) {
        var inst = this;

        function runNotification(opponent) {
            inst.gameSupportController.notifyAboutNetworkStatusChange(
                opponent,
                connectionId ? null : disconnectedClient._id,
                connectionId ? disconnectedClient._id : null
            );
        }

        return this.clientsDBManager
            .get(opponentId)
            .then(runNotification)
            .catch(errorLog);
    };

//TODO check if its need to notify right now
GameSupportService.prototype.notifyAboutNewClient = function (newClient) {
    var inst = this;

    function runNotification(clients) {
        if (clients && clients.length) {
            return inst.gameSupportController.notifyAboutNewClient(newClient, clients);
        }
        return {};
    }
    this.clientsDBManager
        .getClientsExcept(newClient)
        .then(runNotification)
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
