var _ = require('lodash');
const IOC = req('server/constants/ioc.constants');
var CommonUtils = req('server/utils/common-utils');
var SessionUtils = req('server/utils/session-utils');
var logger = req('server/logging/logger').create('GenericTransmitter');

function prepareIds(clientIds) {
    return _.map(CommonUtils.createArray(clientIds), function(id) {
        return _.isString(id) ? id : id.toString();
    });
}

function GenericTransmitter() {
}

GenericTransmitter.prototype.send = function (clientsIds, type, message) {
    var preparedClientsIds;
    var inst = this;
    if (clientsIds) {
        new Promise(function (resolve) {
            preparedClientsIds = prepareIds(clientsIds);
            inst.wss.forEach(function (connection) {
                var id = SessionUtils.getClientId(connection.getSession());
                if (id && preparedClientsIds.indexOf(id.toString()) >= 0) {
                    connection.sendData(message, type);
                    logger.debug('send(to: %s)', connection.getId());
                }
            });
            resolve();
        });
    }
};

GenericTransmitter.prototype.sendAllExcept = function (exceptClientsIds, type, message) {
    var preparedExcepts;
    var inst = this;
    new Promise(function (resolve) {
        if (exceptClientsIds) {
            preparedExcepts = prepareIds(exceptClientsIds);
            inst.wss.forEach(function (connection) {
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