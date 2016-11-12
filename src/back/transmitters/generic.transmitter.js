var _ = require('lodash');
var constants = require('../constants/constants');
var CommonUtils = req('src/back/utils/common-utils');
var SessionUtils = req('src/back/utils/session-utils');
var logger = req('src/js/logger').create('GenericTransmitter');

function GenericTransmitter() {
}

GenericTransmitter.prototype.send = function (clientsConnectionIds, type, message) {
    var to;
    if (clientsConnectionIds) {
        to = _.isArray(clientsConnectionIds) ? clientsConnectionIds : [clientsConnectionIds];
        to = this.wss.getWrappers(to);
        _.forEach(to, function (client) {
            client.sendData(message, type);
        });
    }
};

GenericTransmitter.prototype.sendAllExcept = function (exceptClientsIds, type, message) {
    var preparedExcepts;
    var inst = this;
    new Promise(function (resolve) {
        if (exceptClientsIds) {
            preparedExcepts = CommonUtils.createArray(exceptClientsIds).map(function (id) {
                return typeof id === 'string' ? id : id.toString();
            });
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