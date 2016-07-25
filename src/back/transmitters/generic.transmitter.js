var _ = require('lodash');
var constants = require('../constants');

function GenericTransmitter() {}

GenericTransmitter.prototype.send = function(clientsConnectionIds, type, message) {
    var to;
    if (clientsConnectionIds) {
        to = _.isArray(clientsConnectionIds) ? clientsConnectionIds : [clientsConnectionIds];
        to = this.wss.getWrappers(to);
        _.forEach(to, function(client) {
            client.sendData(message, type);
        });
    }
};

GenericTransmitter.prototype.getName = function() {
    return constants.GENERIC_TRANSMITTER;
};

GenericTransmitter.prototype.postConstructor = function(ioc) {
    this.wss = ioc[constants.WSS];
};

module.exports = {
    class: GenericTransmitter
};