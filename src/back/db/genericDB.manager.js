var _ = require('lodash');
var constants = req('src/back/constants/constants');
var logger = req('src/js/logger').create('DB');
var funcUtils = req('src/back/utils/function-utils');
var cfg = req('prop').db;
var utils = req('src/js/utils');
var bongo = require('mongodb');
var assert = require('assert');
var errorLog = funcUtils.error(logger);

var messages = {
    dbCfg: 'Db config invalid',
    dbUser: 'Db user name invalid',
    dbName: 'Db server name invalid',
    notEmpty: 'Collection name cannot be empty!',
    criteriaNotEmpty: 'Criteria cannot be empty!'
};
var validate = {
    dbConfig: function () {
        assert.notEqual(cfg, null, messages.notEmpty);
        assert.notEqual(cfg.user, null, messages.dbUser);
        assert.notEqual(cfg.dbName, null, messages.dbName);
        assert.notEqual(cfg.user, '...', messages.dbUser);
        assert.notEqual(cfg.dbName, '...', messages.dbName);
    },
    collectionName: function (collName) {
        assert.notEqual(collName, null, messages.notEmpty);
        assert.notEqual(collName, '', messages.notEmpty);
    },
    criteria: function (criteria) {
        assert.notEqual(criteria, null, messages.criteriaNotEmpty);
    }
};
var Observable = req('bin/Observable').class;
validate.dbConfig(cfg);

function GenericDBManager() {
}

GenericDBManager.prototype = Object.create(Observable.prototype);
GenericDBManager.prototype.constructor = GenericDBManager;

GenericDBManager.prototype.init = function () {
    this.connection = null;
};
GenericDBManager.prototype.setCollectionName = function (collectionName) {
    this.collectionName = collectionName;
};
GenericDBManager.prototype.getCollectionName = function () {
    return this.collectionName;
};
GenericDBManager.prototype.exec = function () {
    var inst = this;
    if (!this.connection) {
        try {
            return new Promise(function (resolve) {
                bongo.connect(inst._getDBUrl(), function (error, db) {
                    assert.equal(null, error);
                    inst.connection = db;
                    resolve(inst.connection);
                });
            }).catch(errorLog);
        } catch (e) {
            logger.error(e.message);
        }
    }
    return Promise.resolve(inst.connection).catch(errorLog);
};
GenericDBManager.prototype.update = function () {

};
GenericDBManager.prototype._getDoc = function (criteria, callback, mappings) {
    var inst = this;
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(inst.collectionName);
    validate.criteria(preparedCriteria);
    this.exec().then(function (db) {
        db.collection(inst.collectionName).find(preparedCriteria, function (error, cursor) {
            cursor.next(function (cursorError, doc) {
                if (cursorError) {
                    logger.debug('An ERROR has occurred while extracted document from "%s".', inst.collectionName);
                    callback({});
                } else {
                    logger.debug('Document {_id: "%s"} was successfully extracted from "%s" by criteria: %s',
                        doc ? doc._id : null,
                        inst.collectionName,
                        JSON.stringify(preparedCriteria));
                    if (mappings) {
                        callback(utils.extractFields(doc, mappings));
                    } else {
                        callback(doc);
                    }
                }
            });
        });
    });
};
GenericDBManager.prototype._save = function (doc, callback, criteria, mappings) {
    var id = doc._id;
    delete doc._id;
    if (criteria) {
        this._correctCriteria(criteria);
        this._update(criteria, doc, callback, mappings);
    } else if (utils.hasContent(id)) {
        this._update({_id: this.getObjectId(id)}, doc, callback, mappings);
    } else {
        this._insert(doc, callback, mappings);
    }
};
GenericDBManager.prototype._saveEntities = function (/*doc, callback*/) {
    logger.info('_saveEntities not implemented');
};
GenericDBManager.prototype._update = function (criteria, doc, callback, mappings, upsert) {
    var inst = this;
    var preparedUpsert = utils.hasContent(upsert) ? !!upsert : true;
    validate.collectionName(this.collectionName);
    inst._correctCriteria(criteria);
    this.exec().then(function (db) {
        var id = doc._id;
        delete doc._id;
        if (!mappings) {
            db.collection(inst.collectionName).updateOne(criteria || {_id: inst.getObjectId(id)}, doc, {
                upsert: preparedUpsert,
                raw: true
            }, function (error, result) {
                if (error) {
                    logger.error('An ERROR has occurred while updating document in "%s".', inst.collectionName);
                    throw new Error(error);
                } else if (typeof callback === 'function') {
                    logger.debug('Document was successfully updated in "%s".', inst.collectionName);
                    callback(result.upsertedId ? result.upsertedId._id : null);
                }
            });
        } else {
            db.collection(inst.collectionName).find(criteria, function (error, cursor) {
                cursor.next(function (cursorError, cursorDoc) {
                    if (cursorError) {
                        logger.error('An ERROR has occurred while getting document from "%s" to update.',
                            inst.collectionName);
                        callback(null);
                    } else {
                        logger.debug('Document {_id: "%s"} was successfully extracted from "%s".',
                            doc ? doc._id : null,
                            inst.collectionName);
                        inst._mergeTo(cursorDoc, doc, mappings);
                        inst._update({_id: cursorDoc._id}, cursorDoc, function () {
                            callback(cursorDoc._id);
                        });
                    }
                    return false;
                });
            });
        }
    });
};
GenericDBManager.prototype._insert = function (doc, callback) {
    var inst = this;
    validate.collectionName(this.collectionName);
    this.exec().then(function (db) {
        db.collection(inst.collectionName).insertOne(doc, function (error, result) {
            var id;
            if (error) {
                logger.error('An ERROR has occurred while inserting document in "%s": \n%s.',
                    inst.collectionName,
                    error.message);
                throw new Error(error);
            } else if (typeof(callback) === 'function') {
                id = doc._id || result.insertedId;
                logger.debug('Document was successfully inserted into "%s".', inst.collectionName);
                callback(id);
            }
        });
    });
};

GenericDBManager.prototype._delete = function (criteria, callback) {
    var inst = this;
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(this.collectionName);
    this.exec().then(function (db) {
        db.collection(inst.collectionName).removeOne(preparedCriteria, function (error, result) {
            if (error) {
                logger.error('An ERROR has occurred while deleting document in "%s".', inst.collectionName);
                throw error;
            } else if (typeof(callback) === 'function') {
                logger.debug('Document was successfully deleted in "%s".', inst.collectionName);
                callback(result);
            }
        });
    });
};

GenericDBManager.prototype._deleteMany = function (criteria, callback) {
    var inst = this;
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(this.collectionName);
    this.exec().then(function (db) {
        db.collection(inst.collectionName).deleteMany(preparedCriteria, function (error, result) {
            if (error) {
                logger.error('An ERROR has occurred while deleting document in "%s".', inst.collectionName);
                throw error;
            } else if (typeof(callback) === 'function') {
                logger.debug('Documents were successfully deleted in "%s".', inst.collectionName);
                callback(result);
            }
        });
    });
};

GenericDBManager.prototype._list = function (criteria, callback, mappings) {
    var inst = this;
    validate.collectionName(inst.collectionName);
    this.exec().then(function (db) {
        var cursor = db.collection(inst.collectionName).find(criteria);
        var index = 0;
        var res = [];
        cursor.count({}, function (error, count) {
            if (count) {
                cursor.forEach(function (doc) {
                    index++;
                    if (mappings) {
                        res.push(utils.extractFields(doc, mappings));
                    } else {
                        res.push(doc);
                    }
                    if (index === count && typeof(callback) === 'function') {
                        logger.debug('List(num: %s) of documents was successfully extracted from "%s".',
                            index, inst.collectionName);
                        callback(res);
                    }
                });
            } else if (typeof(callback) === 'function') {
                logger.debug('List(num: %s) of documents was successfully extracted from "%s".',
                    index,
                    inst.collectionName);
                callback(res);
            }
        });
    });
};

GenericDBManager.prototype._mergeTo = function (dest, src, mappings) {
    if (mappings && mappings.length) {
        mappings.forEach(function (mappingItem) {
            var srcValue = utils.getValueFromObjectByPath(src, mappingItem.input || mappingItem.property);
            utils.setValueToObjectByPath(dest, mappingItem.property, srcValue);
        });
    }
    return dest;
};

/**************************/

GenericDBManager.prototype.save = function (doc, mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst._save(doc, function (data) {
            inst.propertyChange('save', [data, doc, mappings]);
            resolve(data);
        }, null, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.saveByCriteria = function (doc, criteria, mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst._save(doc, function (data) {
            inst.propertyChange('saveByCriteria', [data, doc, criteria, mappings]);
            resolve(data);
        }, criteria, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.get = function (ids, mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        var criteria;
        if (Array.isArray(ids)) {
            criteria = {
                _id: {
                    $in: _.map(ids, inst.getObjectId.bind(inst))
                }
            };
            inst._list(criteria, function (entities) {
                inst.propertyChange('list', [entities, ids, mappings]);
                resolve(entities);
            }, mappings);
        } else {
            criteria = {
                _id: inst.getObjectId(ids)
            };
            inst._getDoc(criteria, function (entities) {
                inst.propertyChange('get', [entities, ids, mappings]);
                resolve(entities);
            }, mappings);
        }
    }).catch(errorLog);
};

GenericDBManager.prototype.getByCriteria = function (criteria, mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst._getDoc(criteria, function (entities) {
            inst.propertyChange('getByCriteria', [entities, criteria, mappings]);
            resolve(entities);
        }, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.remove = function (id) {
    var inst = this;
    return new Promise(function (resolve) {
        var criteria = {_id: inst.getObjectId(id)};
        if (_.isArray(id)) {
            criteria = {
                _id: {
                    $in: inst.getObjectIdsList(id)
                }
            };
            inst._deleteMany(criteria, function (data) {
                inst.propertyChange('remove', [data, id]);
                resolve(data);
            });
        } else {
            criteria = {_id: inst.getObjectId(id)};
            inst._delete(criteria, function (data) {
                inst.propertyChange('remove', [data, id]);
                resolve(data);
            });
        }
    }).catch(errorLog);
};

GenericDBManager.prototype.list = function (mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst._list({}, function (entities) {
            inst.propertyChange('list', [{}/*filters*/, mappings]);
            resolve(entities);
        }, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.listByCriteria = function (criteria, mappings) {
    var inst = this;
    return new Promise(function (resolve) {
        inst._list(criteria, function (entities) {
            inst.propertyChange('list', [criteria, mappings]);
            resolve(entities);
        }, mappings);
    }).catch(errorLog);
};
GenericDBManager.prototype._getDBUrl = function () {
    return 'mongodb://'
        + cfg.user + ':'
        + cfg.pass + '@'
        + cfg.host + ':'
        + cfg.port + '/'
        + cfg.dbName;
};

GenericDBManager.prototype.getObjectId = function (id) {
    if (id instanceof bongo.ObjectID) {
        return id;
    }
    return new bongo.ObjectId(id);
};

GenericDBManager.prototype.getObjectIdsList = function (ids) {
    return _.map(ids, this.getObjectId.bind(this));
};

GenericDBManager.prototype._correctCriteria = function (criteria) {
    if (!criteria) {
        return null;
    }
    if (criteria.hasOwnProperty('_id')) {
        criteria._id = this.getObjectId(criteria._id);
    }
    return criteria;
};

GenericDBManager.prototype.getName = function () {
    return constants.GENERIC_DB_MANAGER;
};

module.exports = {
    class: GenericDBManager
};
