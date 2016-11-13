var _ = require('lodash');
var constants = require('../constants/constants');
var CommonUtils = req('src/back/utils/common-utils');
var SessionUtils = req('src/back/utils/session-utils');
var logger = req('src/js/logger').create('GenericTransmitter');

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
                var id = SessionUtils.getClientId(connection);
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
                var id = SessionUtils.getClientId(connection);
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
    return constants.GENERIC_TRANSMITTER;
};

GenericTransmitter.prototype.postConstructor = function (ioc) {
    this.wss = ioc[constants.WSS];
};

module.exports = {
    class: GenericTransmitter
};