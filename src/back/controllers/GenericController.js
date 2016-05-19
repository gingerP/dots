var controller;
GenericController = function() {};
GenericController.prototype.list = function(req, res, callback) {
    var mappings = req.body.mappings;
    this.service.list(mappings).then(callback);
};
GenericController.prototype.save = function(req, res, callback) {
    var entity = req.body;
    this.service.save(entity).then(callback);
};
GenericController.prototype.get = function(req, res, callback) {
    var id = req.body.id;
    var mappings = req.body.mappings;
    this.service.get(id, mappings).then(callback);
};
GenericController.prototype.getByCriteria = function(req, res, callback) {
    var criteria = req.body.criteria;
    var mappings = req.body.mappings;
    this.service.getByCriteria(criteria, mappings).then(callback);
};
GenericController.prototype.remove = function(req, res, callback) {
    var id = req.body.id;
    this.service.remove(id).then(callback);
};

GenericController.prototype.setService = function(service) {
    this.service = service;
};

controller = new GenericController();
module.exports = {
    class: GenericController,
    instance: controller
};
