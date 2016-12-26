'use strict';

const IOC = req('server/constants/ioc.constants');

function GenericService() {}

GenericService.prototype.setManager = function(manager) {
    this.manager = manager;
};
GenericService.prototype.save = function(doc, mappings) {
    var inst = this;
    return new Promise(function(resolve) {
        inst.manager.save(doc, mappings).then(function(value) {
            resolve(value);
        });
    });
};
GenericService.prototype.get = function(id, mappings) {
    var inst = this;
    return new Promise(function(resolve) {
        inst.manager.get(id, mappings).then(function(value) {
            resolve(value);
        });
    });
};
GenericService.prototype.getByCriteria = function(criteria, mappings) {
    var inst = this;
    return new Promise(function(resolve) {
        inst.manager.getByCriteria(criteria, mappings).then(function(value) {
            resolve(value);
        });
    });
};
GenericService.prototype.remove = function(id) {
    var inst = this;
    return new Promise(function(resolve) {
        inst.manager.remove(id).then(function(removedId) {
            resolve(removedId);
        });
    });
};
GenericService.prototype.list = function(mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst.manager.list(mappings).then(function (entities) {
            resolve(entities);
        });
    });
};

GenericService.prototype.postConstructor = function() {};

GenericService.prototype.getName = function() {
    return IOC.SERVICE.GENERIC;
};

module.exports = {
    class: GenericService
};