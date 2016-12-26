'use strict';

var IOC = require('../constants/ioc.constants');

function GenericController() {
}

GenericController.prototype.setService = function (service) {
    this.service = service;
};

GenericController.prototype.getName = function () {
    return IOC.CONTROLLER.GENERIC;
};

GenericController.prototype.createHandleWithResponse = function () {

};

GenericController.prototype.postConstructor = function () {
};

module.exports = {
    class: GenericController
};
