var GenericTransmitter = require('./generic.transmitter').class;
var constants = require('../constants/constants');

function CommonTransmitter() {}

CommonTransmitter.prototype = Object.create(GenericTransmitter.prototype);
CommonTransmitter.prototype.constructor = CommonTransmitter;

CommonTransmitter.prototype.getName = function() {
    return constants.COMMON_TRANSMITTER;
};

module.exports = {
    class: CommonTransmitter
};