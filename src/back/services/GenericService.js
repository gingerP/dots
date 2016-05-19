GenericService = function() {};
GenericService.prototype.setManager = function(manager) {
    this.manager = manager;
};
GenericService.prototype.save = function(doc, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.manager.save(doc, mappings).then(function(value) {
            resolve(value);
        })
    });
};
GenericService.prototype.get = function(id, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.manager.get(id, mappings).then(function(value) {
            resolve(value);
        });
    });
};
GenericService.prototype.getByCriteria = function(criteria, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.manager.getByCriteria(criteria, mappings).then(function(value) {
            resolve(value);
        });
    });
};
GenericService.prototype.remove = function(id) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.manager.remove(id).then(function(id) {
            resolve(id);
        });
    });
};
GenericService.prototype.list = function(mappings) {
    var inst = this;
    return new Promise(function (resolve, reject) {
        inst.manager.list(mappings).then(function (entities) {
            resolve(entities);
        });
    });
};

module.exports = {
    class: GenericService
};