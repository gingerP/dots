'use strict';

var GenericDBManager = require('./genericDB.manager').class;
var DB = require('../constants/db');
var IOC = require('../constants/ioc.constants');
var funcUtils = require('../utils/function-utils');
var logger = require('server/logging/logger').create('ClientsDBManager');
var errorLogger = funcUtils.error(logger);
var Promise = require('bluebird');

class ClientsDBManager extends GenericDBManager {

    constructor() {
        super();
        this.collectionName = DB.COLLECTION.CLIENTS;
    }

    async getClient(id) {
        if (id) {
            const client = this.get(id);
            if (client.auth) {
                delete client.auth.token;
            }
            return client;
        }
        return null;
    }

    async getClientByConnectionId(connectionId) {
        return this.getByCriteria({connection_id: connectionId});
    }

    async getClientsExcept(client) {
        return this.listByCriteria({
            _id: {
                $ne: this.getObjectId(client._id)
            }
        });
    }

    async getOnlineClients() {
        return this.listByCriteria({isOnline: true});
    }

    async getClientsPair(clientId, connectionId) {
        return Promise.all([
            this.getClient(clientId),                            //To
            this.getClientByConnectionId(connectionId)           //From
        ]);
    }

    async getMaxRating(criteria = {}) {
        const collection = await this.getCollection();
        const cursor = await collection.find(criteria).sort({'rating':-1}).limit(1);
        if (await cursor.hasNext()) {
            const user = await cursor.next();
            return user ? user.rating : 0;
        }
        return 0;
    }

    getByAuthIdType(authId, type) {
        return this.getByCriteria({
            'auth.id': authId,
            'auth.type': type
        });
    }

    getName() {
        return IOC.DB_MANAGER.CLIENTS;
    }

    postConstructor() {
    }
}

module.exports = {
    class: ClientsDBManager
};