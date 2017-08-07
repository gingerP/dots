'use strict';

var _ = require('lodash');
var IOC = require('server/constants/ioc.constants');
var logger = require('server/logging/logger').create('DB');
var funcUtils = require('server/utils/function-utils');
var cfg = require('config/config').db;
var utils = require('server/utils/utils');
var mongo = require('mongodb');
var assert = require('assert');
var errorLog = funcUtils.error(logger);
var Promise = require('bluebird');

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
var Observable = require('server/modules/Observable').class;
validate.dbConfig(cfg);

function _getDBUrl() {
    return 'mongodb://'
        + cfg.user + ':'
        + cfg.pass + '@'
        + cfg.host + ':'
        + cfg.port + '/'
        + cfg.dbName;
}

function getObjectId(id) {
    if (id instanceof mongo.ObjectID) {
        return id;
    }
    return new mongo.ObjectId(id);
}

function getReplacedId(isUpsert, result, id) {
    if (!isUpsert) {
        return result.upsertedId ? result.upsertedId._id : null;
    }
    return id;
}

class GenericDBManager extends Observable {


    async init() {
        this.connection = null;
    }

    async setCollectionName(collectionName) {
        this.collectionName = collectionName;
    }

    async getCollectionName() {
        return this.collectionName;
    }

    async exec() {
        try {
            if (!this.connection) {
                this.connection = await mongo.connect(_getDBUrl());
                return this.connection;
            }
            return this.connection;
        } catch (e) {
            errorLog(e);
        }
    }

    async update() {

    }

    async _getDoc(criteria, mappings) {
        try {
            let preparedCriteria = criteria;
            if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
                preparedCriteria = {_id: new getObjectId(criteria)};
            }
            validate.collectionName(this.collectionName);
            validate.criteria(preparedCriteria);
            const db = await this.exec();
            const cursor = await db.collection(this.collectionName).find(preparedCriteria);
            const doc = await cursor.next();
            logger.debug(
                `Document {_id: ${doc ? doc._id : null} was successfully extracted from ${this.collectionName} by criteria: ${JSON.stringify(preparedCriteria)}`
            );
            if (mappings) {
                return utils.extractFields(doc, mappings);
            } else {
                return doc;
            }
        } catch (e) {
            errorLog(e);
        }
    }

    async _save(doc, criteria, mappings) {
        try {
            var id = doc._id;
            if (criteria) {
                delete doc._id;
                this._correctCriteria(criteria);
                return await this._update(criteria, doc, mappings);
            } else if (utils.hasContent(id)) {
                return await this._update({_id: getObjectId(id)}, doc, mappings);
            } else {
                delete doc._id;
                return await this._insert(doc, mappings);
            }
        } catch (e) {
            errorLog(e);
        }
    }

    async _saveEntities(/*doc, callback*/) {
        logger.info('_saveEntities not implemented');
    }

    async _update(criteria, doc, callback, mappings, upsert) {
        const preparedUpsert = utils.hasContent(upsert) ? Boolean(upsert) : true;
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
                        callback(getReplacedId(preparedUpsert, result, id));
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
    }

    async _insert(doc) {
        try {
            validate.collectionName(this.collectionName);
            const db = await this.exec();
            const result = await db.collection(this.collectionName).insertOne(doc);
            const id = doc._id || result.insertedId;
            logger.debug(`Document was successfully inserted into "${this.collectionName}".`);
            return this._getDoc(id);
        } catch (e) {
            logger.error(`An ERROR has occurred while inserting document in "${this.collectionName}": \n${e.message}.`);
        }
    }

    async _delete(criteria, callback) {
        var preparedCriteria = criteria;
        if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
            preparedCriteria = {_id: new getObjectId(criteria)};
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
    }

    async _deleteMany(criteria, callback) {
        var preparedCriteria = criteria;
        if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
            preparedCriteria = {_id: new getObjectId(criteria)};
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
    }

    async _list(criteria, mappings) {
        validate.collectionName(this.collectionName);
        const db = await this.exec();
        const cursor = await db.collection(this.collectionName).find(criteria);
        let index = 0;
        let result = [];
        const count = await cursor.count({});
        if (count) {
            return new Promise((resolve) => {
                cursor.forEach((doc) => {
                    index++;
                    if (mappings) {
                        result.push(utils.extractFields(doc, mappings));
                    } else {
                        result.push(doc);
                    }
                    if (index === count) {
                        logger.debug('List(num: %s) of documents was successfully extracted from "%s".',
                            index, this.collectionName);
                        resolve(result);
                    }
                });
            });

        } else {
            logger.debug(`List(num: ${index}) of documents was successfully extracted from "${this.collectionName}".`);
            return result;
        }
    }

    _mergeTo(dest, src, mappings) {
        if (mappings && mappings.length) {
            mappings.forEach((mappingItem) => {
                var srcValue = utils.getValueFromObjectByPath(src, mappingItem.input || mappingItem.property);
                utils.setValueToObjectByPath(dest, mappingItem.property, srcValue);
            });
        }
        return dest;
    }

    /**************************/

    async save(doc, mappings) {
        try {
            const data = await this._save(doc, null, mappings);
            this.propertyChange('save', [data, doc, mappings]);
            return data;
        } catch (e) {
            errorLog(e);
        }
    }

    async saveByCriteria(doc, criteria, mappings) {
        return new Promise((resolve) => {
            this._save(doc, (data) => {
                this.propertyChange('saveByCriteria', [data, doc, criteria, mappings]);
                resolve(data);
            }, criteria, mappings);
        }).catch(errorLog);
    }

    async get(ids, mappings) {
        try {
            if (Array.isArray(ids)) {
                const criteria = {
                    _id: {
                        $in: _.map(ids, getObjectId.bind(this))
                    }
                };
                const entities = await this._list(criteria, mappings);
                this.propertyChange('list', [entities, ids, mappings]);
                return entities;
            } else {
                const criteria = {
                    _id: getObjectId(ids)
                };
                const entities = await this._getDoc(criteria, mappings);
                this.propertyChange('get', [entities, ids, mappings]);
                return entities;
            }
        } catch (e) {
            errorLog(e);
            return null;
        }
    }

    async getByCriteria(criteria, mappings) {
        try {
            const entity = await this._getDoc(criteria, mappings);
            this.propertyChange('getByCriteria', [entities, criteria, mappings]);
            return entity;
        } catch (e) {
            errorLog(e);
        }
    }

    async remove(id) {
        return new Promise((resolve) => {
            var criteria = {_id: getObjectId(id)};
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
                criteria = {_id: getObjectId(id)};
                this._delete(criteria, (data) => {
                    this.propertyChange('remove', [data, id]);
                    resolve(data);
                });
            }
        }).catch(errorLog);
    }

    async list(mappings) {
        try {
            const entities = await this._list({}, mappings);
            this.propertyChange('list', [{}/*filters*/, mappings]);
            return entities;
        } catch (e) {
            errorLog(e);
        }
    }

    async listByCriteria(criteria, mappings) {
        try {
            const entities = await this._list(criteria, mappings);
            this.propertyChange('list', [criteria, mappings]);
            return entities;
        } catch (e) {
            errorLog(e);
        }
    }

    async getObjectIdsList(ids) {
        return _.map(ids, this.getObjectId.bind(this));
    }

    async _correctCriteria(criteria) {
        if (!criteria) {
            return null;
        }
        if (criteria.hasOwnProperty('_id')) {
            criteria._id = getObjectId(criteria._id);
        }
        return criteria;
    }

    async getName() {
        return IOC.DB_MANAGER.GENERIC;
    }
}

module.exports = {
    class: GenericDBManager
};
