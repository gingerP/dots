var _ = require('lodash');
const IOC = require('server/constants/ioc.constants');
var CommonUtils = require('server/utils/common-utils');
var SessionUtils = require('server/utils/session-utils');
var logger = require('server/logging/logger').create('GenericTransmitter');
var Promise = require('bluebird');

function prepareIds(clientIds) {
    return _.map(CommonUtils.createArray(clientIds), String);
}

function GenericTransmitter() {
}

GenericTransmitter.prototype.send = function (type, clientsIds, message) {
    return new Promise((resolve) => {
        const preparedClientsIds = prepareIds(clientsIds);
        this.wss.forEach((connection) => {
            var id = SessionUtils.getClientId(connection.getSession());
            if (id && preparedClientsIds.indexOf(id.toString()) >= 0) {
                connection.sendData(message, type);
                logger.debug('send(to: %s)', connection.getId());
            }
        });
        resolve();
    });
};

GenericTransmitter.prototype.sendAllExcept = function (exceptClientsIds, type, message) {
    var preparedExcepts;
    new Promise((resolve) => {
        if (exceptClientsIds) {
            preparedExcepts = prepareIds(exceptClientsIds);
            this.wss.forEach((connection) => {
                var id = SessionUtils.getClientId(connection.getSession());
                if (id && preparedExcepts.indexOf(id.toString()) < 0) {
                    connection.sendData(message, type);
                    logger.debug('sendAllExcept(to: %s)', connection.getId());
                }
            });
        }
        resolve();
    });
};

GenericTransmitter.prototype.getName = function () {
    return IOC.TRANSMITTER.GENERIC;
};

GenericTransmitter.prototype.postConstructor = function (ioc) {
    this.wss = ioc[IOC.COMMON.WSS];
};

module.exports = {
    class: GenericTransmitter
};
