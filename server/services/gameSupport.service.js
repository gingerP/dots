'use strict';

var GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
var animals = require('../animals');
var funcUtils = require('../utils/function-utils');
var creationUtils = require('server/utils/creation-utils');
var SessionUtils = require('server/utils/session-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = require('server/logging/logger').create('GameSupportService');
var errorLog = funcUtils.error(logger);
var _ = require('lodash');
var Promise = require('bluebird');
const Errors = require('../errors');

function getRandomAnimal() {
    var randomIndex = Math.round((Math.random() * animals.length - 1));
    return animals[randomIndex];
}

function updateSession(socket, client) {
    var session;
    if (!client) {
        throw new Errors.ClientNotFoundError();
    }
    session = socket.getSession();
    SessionUtils.storeClientsIds(session, client._id);

    return socket.saveSession().return(client);
}

async function createClient(clientsDB) {
    var client = creationUtils.newClient(getRandomAnimal(), null, null, true);

    const savedClient = await clientsDB.save(client);
    return savedClient;
}

class GameSupportService extends GenericService {

    async onNewClient(message) {
        const inst = this;
        try {
            const clientsDB = inst.clientsDBManager;
            const session = message.client.getSession();
            const sessionClientId = SessionUtils.getClientId(session);
            let client;

            if (sessionClientId) {
                client = await clientsDB.get(sessionClientId);
            } else {
                client = await createClient(clientsDB);
            }
            await updateSession(message.client, client);
            await inst.notifyAboutConnectionStatus(client, true);
            message.callback(client);

        } catch (e) {
            errorLog(e);
        }
    }

    async onDisconnect(message) {
        const inst = this;
        const clientId = SessionUtils.getClientId(message.client.getSession());

        if (!clientId) {
            logger.warn('Removed connection WITHOUT clientId!');
            message.callback(true);
        }

        const isOnline = false;
        const disconnectedClient = await this.updateNetworkStatus(clientId, isOnline);
        await inst.notifyAboutConnectionStatus(disconnectedClient, isOnline);
    }

    async onReconnect(message) {
        const inst = this;

        let reconnectedClientId = message.data;
        let session;
        let sessionClientId;
        logger.debug('onReconnect: ' + reconnectedClientId.toString());
        session = message.client.getSession();
        sessionClientId = SessionUtils.getClientId(session);

        /**
         * Pick up authorized client from session
         */
        if (!_.isUndefined(sessionClientId)) {
            reconnectedClientId = sessionClientId;
        }
        const client = await inst.updateNetworkStatus(reconnectedClientId, true);
        await updateSession(message.client, client);
        const isOnline = true;
        await inst.notifyAboutConnectionStatus(client, isOnline);
        return client;
    }

    notifyAboutConnectionStatus(client, isOnline) {
        this.gameSupportController.notifyClientsAboutNetworkStatusChange(
            isOnline ? null : client,
            isOnline ? client : null
        );
    }

    handleConnectionNotification(clientId, connectionId) {
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
    }

    async updateNetworkStatus(clientId, isOnline) {
        const client = await this.clientsDBManager.get(clientId);
        if (!client) {
            throw new Errors.ClientNotFoundError();
        }
        client.isOnline = Boolean(isOnline);
        return this.clientsDBManager.save(client);
    }

    saveNewConnectionId(client, connectionId) {
        var inst = this;
        client.connection_id = connectionId;

        function getClient(clientId) {
            return inst.clientsDBManager.get(clientId);
        }

        return this.clientsDBManager
            .save(client, {_id: client._id})
            .then(getClient);
    }

    saveNewClientConnectionId(client, connectionId) {
        var inst = this;
        client.connection_id = connectionId;
        delete client._id;

        function getClientByConnection() {
            return inst.clientsDBManager.getClientByConnectionId(client.connection_id);
        }

        return inst.clientsDBManager
            .save(client)
            .then(getClientByConnection);
    }

    notifyOpponentAboutNetworkStatusChange(disconnectedClient, opponentId, connectionId) {
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
    }

    markAnotherClientConnectionsAsInactive(/*activeConnection*/) {

    }

//TODO check if its need to notify right now
    notifyAboutNewClient(newClient) {
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
    }

    newGame(clientAId, clientBId, activePlayerId) {
        return this.gameDBManager.createGame(clientAId, clientBId, activePlayerId, gameStatuses.active)
            .then((id) => this.gameDBManager.get(id));
    }

    getName() {
        return IOC.SERVICE.GAME_SUPPORT;
    }

    postConstructor(ioc) {
        this.gameSupportController = ioc[IOC.CONTROLLER.GAME_SUPPORT];
        this.gameSupportController.onNewClient(this.onNewClient.bind(this));
        this.gameSupportController.onReconnect(this.onReconnect.bind(this));
        this.gameSupportController.onRemoveConnection(this.onDisconnect.bind(this));
        this.cachedNetworkStatusesDBManager = ioc[IOC.DB_MANAGER.CACHED_NETWORK_STATUSES];
        this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
        this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
    }
}

module.exports = {
    class: GameSupportService
};
