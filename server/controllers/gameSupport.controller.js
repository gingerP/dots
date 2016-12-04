'use strict';

var _ = require('lodash');
var Events = require('../events');
var constants = require('../constants/constants');
var GenericController = require('./generic.controller').class;
var CommonUtils = req('server/utils/common-utils');
var logger = req('server/logging/logger').create('GameSupportController');
var sessionUtils = req('server/utils/session-utils');

function GameSupportController() {
}

GameSupportController.prototype = Object.create(GenericController.prototype);
GameSupportController.prototype.constructor = GameSupportController;

GameSupportController.prototype.onNewClient = function (handler) {
    this.wss.addListener(Events.new_client, handler);
};

GameSupportController.prototype.onReconnect = function (handler) {
    this.wss.addListener(Events.client_reconnect, handler);
};

GameSupportController.prototype.onDisconnect = function (handler) {
    this.wss.addListener(this.wss.events.REMOVE_CONNECTION, handler);
};

GameSupportController.prototype.notifyClientsAboutNetworkStatusChange =
    function (offlineClients, onlineClients) {
        var preparedOfflineClients = CommonUtils.createArray(offlineClients);
        var preparedOnlineClients = CommonUtils.createArray(onlineClients);
        var summaryClients = preparedOfflineClients.concat(_.map(preparedOnlineClients, '_id'));
        var notifyDetails = {
            disconnected: _.map(preparedOfflineClients, '_id'),
            reconnected: preparedOnlineClients
        };

        logger.debug('Notify about network status: %s', JSON.stringify(notifyDetails));
        this.transmitter.sendAllExcept(
            summaryClients,
            Events.clients_status_change,
            notifyDetails
        );
    };

GameSupportController.prototype.notifyAboutNetworkStatusChange =
    function (clientsIdsToNotify, disconnectedClientsIds, reconnectedClientsIds) {
        var data = {
            disconnected: CommonUtils.createArray(disconnectedClientsIds || []),
            reconnected: CommonUtils.createArray(reconnectedClientsIds || [])
        };
        this.transmitter.send(
            _.map(CommonUtils.createArray(clientsIdsToNotify), '_id'),
            Events.client_disconnect,
            data);
    };

/*GameSupportController.prototype.markClientConnectionInactive =
    function (activeConnection) {
        var clientId = sessionUtils.getClientId(activeConnection);
        var connectionId = activeConnection.getId();

        this.wss.forEach(function(connection) {
            var anotherClientId = sessionUtils.getClientId(activeConnection);

        });
    };*/

GameSupportController.prototype.notifyAboutNewClient = function (newClient, clients) {
    this.transmitter.send(_.map(clients, '_id'), Events.new_client, newClient);
};

GameSupportController.prototype.postConstructor = function (ioc) {
    this.wss = ioc[constants.WSS];
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
};

GameSupportController.prototype.getName = function () {
    return constants.GAME_SUPPORT_CONTROLLER;
};

module.exports = {
    class: GameSupportController
};