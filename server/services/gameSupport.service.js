'use strict';

var GenericService = require('./generic.service').class;
const IOC = req('server/constants/ioc.constants');
var animals = require('../animals');
var funcUtils = require('../utils/function-utils');
var creationUtils = req('server/utils/creation-utils');
var SessionUtils = req('server/utils/session-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = req('server/logging/logger').create('GameSupportService');
var errorLog = funcUtils.error(logger);
var _ = require('lodash');
var Promise = require('q');
const SessionConstants = req('server/constants/session-constants');
const CLIENT_NOT_EXIST = 'Reconnected Client does NOT exist';

function getRandomAnimal() {
    var randomIndex = Math.round((Math.random() * animals.length - 1));
    return animals[randomIndex];
}

function GameSupportService() {
}

GameSupportService.prototype = Object.create(GenericService.prototype);
GameSupportService.prototype.constructor = GameSupportService;

GameSupportService.prototype.onNewClient = function (message) {
    var inst = this;
    var client = creationUtils.newClient(getRandomAnimal(), null, null, true);

    function getClient(clientId) {
        return inst.clientsDBManager.get(clientId);
    }

    function notifyAboutNewClient(newClient) {
        var isOnline = true;
        inst.notifyAboutConnectionStatus(newClient, isOnline);
        return newClient;
    }

    function storeClient(newClient) {
        message.client.updateSession({[SessionConstants.CLIENT_ID]: newClient._id.toString()});
        SessionUtils.storeClientId(newClient._id, message.client.getSession());
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
    var clientId = SessionUtils.getClientId(message.client.getSession());

    function handleConnectionNotification(disconnectedClient) {
        var isOnline = false;
        return inst.notifyAboutConnectionStatus(disconnectedClient, isOnline);
    }

    if (!clientId) {
        logger.warn('Removed connection WITHOUT clientId!');
        return Promise.resolve(true);
    }

    return this.updateNetworkStatus(clientId, false)
        .then(handleConnectionNotification)
        .catch(errorLog);
};

GameSupportService.prototype.onReconnect = function (message) {
    var inst = this;
    var reconnectedClientId = message.data._id;
    var reconnectedClient = message.data._id;
    var session;
    var sessionClientId;

    function handleConnectionNotification() {
        var isOnline = true;
        return inst.notifyAboutConnectionStatus(reconnectedClient, isOnline);
    }

    function storeClient(newClient) {
        if (!newClient) {
            throw new Error(CLIENT_NOT_EXIST);
        }
        reconnectedClient = newClient;
        SessionUtils.storeClientId(newClient._id, session);
        return newClient;
    }

    if (message.data) {
        logger.debug('onReconnect: ' + reconnectedClientId.toString());
        session = message.client.getSession();
        sessionClientId = SessionUtils.getClientId(session);

        /**
         * Pick up authorized client from session
         */
        if (!_.isUndefined(sessionClientId)) {
            reconnectedClientId = sessionClientId;
        }
        return inst.updateNetworkStatus(reconnectedClientId, true)
            .then(storeClient)
            .then(message.callback)
            .then(handleConnectionNotification)
            .catch(errorLog);
    }
    return Promise.resolve({});
};

GameSupportService.prototype.notifyAboutConnectionStatus = function (client, isOnline) {
    this.gameSupportController.notifyClientsAboutNetworkStatusChange(
        isOnline ? null : client,
        isOnline ? client : null
    );
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

GameSupportService.prototype.updateNetworkStatus = function (clientId, isOnline) {
    var inst = this;

    function save(client) {
        var clientCopy;
        if (!client) {
            throw new Error(CLIENT_NOT_EXIST);
        }
        client.isOnline = Boolean(isOnline);
        clientCopy = _.cloneDeep(client);
        inst.clientsDBManager.save(client);
        return clientCopy;
    }

    return this.clientsDBManager
        .get(clientId)
        .then(save)
        .catch(errorLog);
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

GameSupportService.prototype.markAnotherClientConnectionsAsInactive = function (/*activeConnection*/) {

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
    return this.gameDBManager.createGame(clientAId, clientBId, activePlayerId, gameStatuses.active)
        .then((id) => this.gameDBManager.get(id));
};

GameSupportService.prototype.getName = function () {
    return IOC.SERVICE.GAME_SUPPORT;
};

GameSupportService.prototype.postConstructor = function (ioc) {
    this.gameSupportController = ioc[IOC.CONTROLLER.GAME_SUPPORT];
    this.gameSupportController.onNewClient(this.onNewClient.bind(this));
    this.gameSupportController.onReconnect(this.onReconnect.bind(this));
    this.gameSupportController.onDisconnect(this.onDisconnect.bind(this));
    this.cachedNetworkStatusesDBManager = ioc[IOC.DB_MANAGER.CACHED_NETWORK_STATUSES];
    this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
    this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
};

module.exports = {
    class: GameSupportService
};
