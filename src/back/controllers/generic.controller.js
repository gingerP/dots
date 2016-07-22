var constants = require('../constants');

GenericController = function() {};

GenericController.prototype.setService = function(service) {
    this.service = service;
};

GenericController.prototype.getName = function() {
    return constants.GENERIC_CONTROLLER;
};

GenericController.prototype.createHandleWithResponse = function(handler) {

};

GenericController.prototype.postConstructor = function() {};

module.exports = {
    class: GenericController
};
