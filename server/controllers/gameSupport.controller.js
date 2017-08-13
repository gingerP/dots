'use strict';

var _ = require('lodash');
const Joi = require('joi');
var Events = require('server/events');
var IOC = require('../constants/ioc.constants');
var GenericController = require('./generic.controller').class;
var CommonUtils = require('server/utils/common-utils');
var logger = require('server/logging/logger').create('GameSupportController');
/*var sessionUtils = require('server/utils/session-utils');*/

class GameSupportController extends GenericController {

    onNewClient(handler) {
        this.wss.setHandler(Events.CLIENT.NEW(), handler);
    }

    onReconnect(handler) {
        this.wss.setHandler(
            Events.CLIENT.RECONNECT(),
            this.validator(Joi.string().length(24).required()),
            handler
        );
    }

    onDisconnect(handler) {
        this.wss.setHandler(
            Events.CLIENT.DISCONNECT,
            this.validator(Joi.string().length(24).required()),
            handler
        );
    }

    onRemoveConnection(handler) {
        this.wss.setHandler(
            this.wss.events.REMOVE_CONNECTION,
            this.validator(Joi.string().length(24).required()),
            handler
        );
    }

    notifyClientsAboutNetworkStatusChange(offlineClients, onlineClients) {
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
            Events.CLIENT.STATUS.CHANGE(),
            notifyDetails
        );
    }

    notifyAboutNetworkStatusChange(clientsIdsToNotify, disconnectedClientsIds, reconnectedClientsIds) {
        var data = {
            disconnected: CommonUtils.createArray(disconnectedClientsIds || []),
            reconnected: CommonUtils.createArray(reconnectedClientsIds || [])
        };
        this.transmitter.send(
            _.map(CommonUtils.createArray(clientsIdsToNotify), '_id'),
            Events.CLIENT.DISCONNECT(),
            data);
    }

    /*GameSupportController.prototype.markClientConnectionInactive =
     function (activeConnection) {
     var clientId = sessionUtils.getClientId(activeConnection);
     var connectionId = activeConnection.getId();

     this.wss.forEach(function(connection) {
     var anotherClientId = sessionUtils.getClientId(activeConnection);

     });
     };*/

    notifyAboutNewClient(newClient, clients) {
        this.transmitter.send(_.map(clients, '_id'), Events.CLIENT.NEW(), newClient);
    }

    postConstructor(ioc) {
        this.wss = ioc[IOC.COMMON.WSS];
        this.transmitter = ioc[IOC.TRANSMITTER.COMMON];
    }

    getName() {
        return IOC.CONTROLLER.GAME_SUPPORT;
    }

}
module.exports = {
    class: GameSupportController
};
