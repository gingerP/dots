var _ = require('lodash');
var constants = req('server/constants/constants');
var logger = req('server/logging/logger').create('DB');
var funcUtils = req('server/utils/function-utils');
var cfg = req('config/application').db;
var utils = req('server/utils/utils');
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
var Observable = req('server/modules/Observable').class;
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
    if (!this.connection) {
        try {
            return new Promise((resolve) => {
                bongo.connect(this._getDBUrl(), (error, db) => {
                    assert.equal(null, error);
                    this.connection = db;
                    resolve(this.connection);
                });
            }).catch(errorLog);
        } catch (e) {
            logger.error(e.message);
        }
    }
    return Promise.resolve(this.connection).catch(errorLog);
};
GenericDBManager.prototype.update = function () {

};
GenericDBManager.prototype._getDoc = function (criteria, callback, mappings) {
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(this.collectionName);
    validate.criteria(preparedCriteria);
    this.exec().then((db) => {
        db.collection(this.collectionName).find(preparedCriteria, (error, cursor) => {
            cursor.next((cursorError, doc) => {
                if (cursorError) {
                    logger.debug('An ERROR has occurred while extracted document from "%s".', this.collectionName);
                    callback({});
                } else {
                    logger.debug('Document {_id: "%s"} was successfully extracted from "%s" by criteria: %s',
                        doc ? doc._id : null,
                        this.collectionName,
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
    if (criteria) {
        delete doc._id;
        this._correctCriteria(criteria);
        this._update(criteria, doc, callback, mappings);
    } else if (utils.hasContent(id)) {
        this._update({_id: this.getObjectId(id)}, doc, callback, mappings);
    } else {
        delete doc._id;
        this._insert(doc, callback, mappings);
    }
};
GenericDBManager.prototype._saveEntities = function (/*doc, callback*/) {
    logger.info('_saveEntities not implemented');
};
GenericDBManager.prototype._update = function (criteria, doc, callback, mappings, upsert) {
    var preparedUpsert = utils.hasContent(upsert) ? !!upsert : true;
    validate.collectionName(this.collectionName);
    this._correctCriteria(criteria);
    this.exec().then((db) => {
        var id = doc._id;
        if (!mappings) {
            db.collection(this.collectionName).replaceOne({_id: id}, doc, {
                upsert: preparedUpsert,
                raw: true
            }, (error, result) => {
                if (error) {
                    logger.error('An ERROR has occurred while updating document in "%s".', this.collectionName);
                    throw new Error(error);
                } else if (typeof callback === 'function') {
                    logger.debug('Document was successfully updated in "%s".', this.collectionName);
                    callback(result.upsertedId ? result.upsertedId._id : null);
                }
            });
        } else {
            delete doc._id;
            db.collection(this.collectionName).find(criteria, (error, cursor) => {
                cursor.next((cursorError, cursorDoc) => {
                    if (cursorError) {
                        logger.error('An ERROR has occurred while getting document from "%s" to update.',
                            this.collectionName);
                        callback(null);
                    } else {
                        logger.debug('Document {_id: "%s"} was successfully extracted from "%s".',
                            doc ? doc._id : null,
                            this.collectionName);
                        this._mergeTo(cursorDoc, doc, mappings);
                        this._update({_id: cursorDoc._id}, cursorDoc, () => {
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
    validate.collectionName(this.collectionName);
    this.exec().then((db) => {
        db.collection(this.collectionName).insertOne(doc, (error, result) => {
            var id;
            if (error) {
                logger.error('An ERROR has occurred while inserting document in "%s": \n%s.',
                    this.collectionName,
                    error.message);
                throw new Error(error);
            } else if (typeof(callback) === 'function') {
                id = doc._id || result.insertedId;
                logger.debug('Document was successfully inserted into "%s".', this.collectionName);
                callback(id);
            }
        });
    });
};

GenericDBManager.prototype._delete = function (criteria, callback) {
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(this.collectionName);
    this.exec().then((db) => {
        db.collection(this.collectionName).removeOne(preparedCriteria, (error, result) => {
            if (error) {
                logger.error('An ERROR has occurred while deleting document in "%s".', this.collectionName);
                throw error;
            } else if (typeof(callback) === 'function') {
                logger.debug('Document was successfully deleted in "%s".', this.collectionName);
                callback(result);
            }
        });
    });
};

GenericDBManager.prototype._deleteMany = function (criteria, callback) {
    var preparedCriteria = criteria;
    if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
        preparedCriteria = {_id: new this.getObjectId(criteria)};
    }
    validate.collectionName(this.collectionName);
    this.exec().then((db) => {
        db.collection(this.collectionName).deleteMany(preparedCriteria, (error, result) => {
            if (error) {
                logger.error('An ERROR has occurred while deleting document in "%s".', this.collectionName);
                throw error;
            } else if (typeof(callback) === 'function') {
                logger.debug('Documents were successfully deleted in "%s".', this.collectionName);
                callback(result);
            }
        });
    });
};

GenericDBManager.prototype._list = function (criteria, callback, mappings) {
    validate.collectionName(this.collectionName);
    this.exec().then((db) => {
        var cursor = db.collection(this.collectionName).find(criteria);
        var index = 0;
        var res = [];
        cursor.count({}, (error, count) => {
            if (count) {
                cursor.forEach((doc) => {
                    index++;
                    if (mappings) {
                        res.push(utils.extractFields(doc, mappings));
                    } else {
                        res.push(doc);
                    }
                    if (index === count && typeof(callback) === 'function') {
                        logger.debug('List(num: %s) of documents was successfully extracted from "%s".',
                            index, this.collectionName);
                        callback(res);
                    }
                });
            } else if (typeof(callback) === 'function') {
                logger.debug('List(num: %s) of documents was successfully extracted from "%s".',
                    index,
                    this.collectionName);
                callback(res);
            }
        });
    });
};

GenericDBManager.prototype._mergeTo = function (dest, src, mappings) {
    if (mappings && mappings.length) {
        mappings.forEach((mappingItem) => {
            var srcValue = utils.getValueFromObjectByPath(src, mappingItem.input || mappingItem.property);
            utils.setValueToObjectByPath(dest, mappingItem.property, srcValue);
        });
    }
    return dest;
};

/**************************/

GenericDBManager.prototype.save = function (doc, mappings) {
    return new Promise((resolve) => {
        this._save(doc, (data) => {
            this.propertyChange('save', [data, doc, mappings]);
            resolve(data);
        }, null, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.saveByCriteria = function (doc, criteria, mappings) {
    return new Promise((resolve) => {
        this._save(doc, (data) => {
            this.propertyChange('saveByCriteria', [data, doc, criteria, mappings]);
            resolve(data);
        }, criteria, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.get = function (ids, mappings) {
    return new Promise((resolve) => {
        var criteria;
        if (Array.isArray(ids)) {
            criteria = {
                _id: {
                    $in: _.map(ids, this.getObjectId.bind(this))
                }
            };
            this._list(criteria, (entities) => {
                this.propertyChange('list', [entities, ids, mappings]);
                resolve(entities);
            }, mappings);
        } else {
            criteria = {
                _id: this.getObjectId(ids)
            };
            this._getDoc(criteria, (entities) => {
                this.propertyChange('get', [entities, ids, mappings]);
                resolve(entities);
            }, mappings);
        }
    }).catch(errorLog);
};

GenericDBManager.prototype.getByCriteria = function (criteria, mappings) {
    return new Promise((resolve) => {
        this._getDoc(criteria, (entities) => {
            this.propertyChange('getByCriteria', [entities, criteria, mappings]);
            resolve(entities);
        }, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.remove = function (id) {
    return new Promise((resolve) => {
        var criteria = {_id: this.getObjectId(id)};
        if (_.isArray(id)) {
            criteria = {
                _id: {
                    $in: this.getObjectIdsList(id)
                }
            };
            this._deleteMany(criteria, (data) => {
                this.propertyChange('remove', [data, id]);
                resolve(data);
            });
        } else {
            criteria = {_id: this.getObjectId(id)};
            this._delete(criteria, (data) => {
                this.propertyChange('remove', [data, id]);
                resolve(data);
            });
        }
    }).catch(errorLog);
};

GenericDBManager.prototype.list = function (mappings) {
    return new Promise((resolve) => {
        this._list({}, (entities) => {
            this.propertyChange('list', [{}/*filters*/, mappings]);
            resolve(entities);
        }, mappings);
    }).catch(errorLog);
};

GenericDBManager.prototype.listByCriteria = function (criteria, mappings) {
    return new Promise((resolve) => {
        this._list(criteria, (entities) => {
            this.propertyChange('list', [criteria, mappings]);
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
