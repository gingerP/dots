'use strict';

var GenericTransmitter = require('./generic.transmitter').class;
const IOC = require('server/constants/ioc.constants');

function CommonTransmitter() {}

CommonTransmitter.prototype = Object.create(GenericTransmitter.prototype);
CommonTransmitter.prototype.constructor = CommonTransmitter;

CommonTransmitter.prototype.getName = function() {
    return IOC.TRANSMITTER.COMMON;
};

module.exports = {
    class: CommonTransmitter
};
