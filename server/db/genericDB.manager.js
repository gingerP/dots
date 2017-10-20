'use strict';

const _ = require('lodash');
const IOC = require('server/constants/ioc.constants');
const logger = require('server/logging/logger').create('DB');
const funcUtils = require('server/utils/function-utils');
const cfg = require('config/config').db;
const utils = require('server/utils/utils');
const mongo = require('mongodb');
const assert = require('assert');
const errorLog = funcUtils.error(logger);
const Promise = require('bluebird');
const Observable = require('server/modules/Observable').class;
const messages = {
    dbCfg: 'Db config invalid',
    dbUser: 'Db user name invalid',
    dbName: 'Db server name invalid',
    notEmpty: 'Collection name cannot be empty!',
    criteriaNotEmpty: 'Criteria cannot be empty!'
};
const validate = {
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
validate.dbConfig(cfg);

function _getDBUrl() {
    return `mongodb://${cfg.user}:${cfg.pass}@${cfg.host}:${cfg.port}/${cfg.dbName}`;
}

class GenericDBManager extends Observable {

    init() {
        this.connection = null;
    }

    setCollectionName(collectionName) {
        this.collectionName = collectionName;
    }

    getCollectionName() {
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
                preparedCriteria = {_id: this.getObjectId(criteria)};
            } else if (criteria instanceof mongo.ObjectID) {
                preparedCriteria = {_id: criteria};
            }
            validate.collectionName(this.collectionName);
            validate.criteria(preparedCriteria);
            const db = await this.exec();
            const cursor = await db.collection(this.collectionName).find(preparedCriteria);
            const doc = await cursor.next();
            if (mappings) {
                return utils.extractFields(doc, mappings);
            } else {
                return doc;
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _save(doc, criteria, mappings) {
        const id = doc._id;
        if (criteria) {
            delete doc._id;
            this._correctCriteria(criteria);
            return this._update(criteria, doc, mappings);
        } else if (utils.hasContent(id)) {
            return this._update({_id: this.getObjectId(id)}, doc, mappings);
        } else {
            delete doc._id;
            return this._insert(doc, mappings);
        }
    }

    async _saveEntities(/*doc, callback*/) {
        logger.info('_saveEntities not implemented');
    }

    async _update(criteria, doc, mappings, upsert) {
        try {
            const preparedUpsert = utils.hasContent(upsert) ? Boolean(upsert) : true;
            validate.collectionName(this.collectionName);
            this._correctCriteria(criteria);
            const db = await this.exec();
            if (!mappings) {
                delete doc._id;
                const cursor = await db.collection(this.collectionName).find(criteria);
                let cursorDoc = await cursor.next();
                let docId;
                if (cursorDoc) {
                    docId = cursorDoc._id;
                    await db.collection(this.collectionName)
                        .replaceOne({_id: docId}, doc, {upsert: preparedUpsert, raw: true});
                } else {
                    const insertResult = await db.collection(this.collectionName).insertOne(doc);
                    docId = insertResult.insertedId;
                }
                logger.debug('Document was successfully updated in "%s".', this.collectionName);
                return this._getDoc(docId);
            } else {
                delete doc._id;
                const cursor = await db.collection(this.collectionName).find(criteria);
                let cursorDoc = await cursor.next();
                this._mergeTo(cursorDoc, doc, mappings);
                cursorDoc = await this._update({_id: cursorDoc._id}, cursorDoc);
                return cursorDoc._id;
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _insert(doc) {
        try {
            validate.collectionName(this.collectionName);
            const db = await this.exec();
            const result = await db.collection(this.collectionName).insertOne(doc);
            const id = doc._id || result.insertedId;
            logger.debug(`Document was successfully inserted into "${this.collectionName}".`);
            return await this._getDoc(id);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _delete(criteria) {
        try {
            let preparedCriteria = criteria;
            if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
                preparedCriteria = {_id: this.getObjectId(criteria)};
            }
            validate.collectionName(this.collectionName);
            const db = await this.exec();
            return await db.collection(this.collectionName).removeOne(preparedCriteria);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _deleteMany(criteria) {
        try {
            let preparedCriteria = criteria;
            if (typeof(criteria) === 'number' || typeof(criteria) === 'string') {
                preparedCriteria = {_id: this.getObjectId(criteria)};
            }
            validate.collectionName(this.collectionName);
            const db = await this.exec();
            return await db.collection(this.collectionName).deleteMany(preparedCriteria);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _findAll(options = {}) {
        try {
            validate.collectionName(this.collectionName);
            const where = options.where || {};
            const mappings = options.mappings || {};
            const db = await this.exec();
            let cursor;
            let chain = db.collection(this.collectionName).find(where);
            if (options.order) {
                chain = chain.sort(options.order);
            }
            if (options.limit) {
                chain = chain.skip(options.limit[0]).limit(options.limit[1]);
            }
            cursor = await chain;
            let index = 0;
            let result = [];
            const totalCount = await cursor.count();
            let count;
            if (totalCount > options.limit[0] && totalCount <= options.limit[0] + options.limit[1]) {
                count = totalCount - options.limit[0];
            } else {
                count = options.limit[1];
            }
            if (count) {
                result = await new Promise((resolve) => {
                    cursor.forEach((doc) => {
                        index++;
                        if (!_.isEmpty(mappings)) {
                            result.push(utils.extractFields(doc, mappings));
                        } else {
                            result.push(doc);
                        }
                        if (index === count) {
                            resolve(result);
                        }
                    });
                });
            }
            if (options.limit) {
                return {
                    totalCount: totalCount,
                    list: result
                }
            } else {
                return result;
            }
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _list(criteria, mappings) {
        try {
            validate.collectionName(this.collectionName);
            const db = await this.exec();
            const cursor = await db.collection(this.collectionName).find(criteria);
            let index = 0;
            let result = [];
            const count = await cursor.count({});
            if (count) {
                result = await new Promise((resolve) => {
                    cursor.forEach((doc) => {
                        index++;
                        if (mappings) {
                            result.push(utils.extractFields(doc, mappings));
                        } else {
                            result.push(doc);
                        }
                        if (index === count) {
                            resolve(result);
                        }
                    });
                });
            }
            return result;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    _mergeTo(dest, src, mappings) {
        if (mappings && mappings.length) {
            mappings.forEach((mappingItem) => {
                const srcValue = utils.getValueFromObjectByPath(src, mappingItem.input || mappingItem.property);
                utils.setValueToObjectByPath(dest, mappingItem.property, srcValue);
            });
        }
        return dest;
    }

    /**************************/

    async getCollection() {
        const db = await this.exec();
        return db.collection(this.collectionName);
    }

    async save(doc, mappings) {
        const entity = await this._save(doc, null, mappings);
        this.propertyChange('save', [entity, doc, mappings]);
        return entity;
    }

    async saveByCriteria(doc, criteria, mappings) {
        const entity = await this._save(doc, criteria, mappings);
        this.propertyChange('saveByCriteria', [entity, doc, criteria, mappings]);
        return entity;
    }

    async get(ids, mappings) {
        if (Array.isArray(ids)) {

            const criteria = {_id: {$in: _.map(ids, this.getObjectId)}};
            const entities = await this._list(criteria, mappings);
            this.propertyChange('list', [entities, ids, mappings]);
            return this.orderByIds(entities, ids);
        } else {
            const criteria = {
                _id: this.getObjectId(ids)
            };
            const entities = await this._getDoc(criteria, mappings);
            this.propertyChange('get', [entities, ids, mappings]);
            return entities;
        }
    }

    async getByCriteria(criteria, mappings) {
        const entity = await this._getDoc(criteria, mappings);
        this.propertyChange('getByCriteria', [entity, criteria, mappings]);
        return entity;
    }

    async remove(id) {
        let criteria;
        if (_.isArray(id)) {
            criteria = {_id: {$in: this.getObjectIdsList(id)}};
            const result = await this._deleteMany(criteria);
            this.propertyChange('remove', [result, id]);
            return result;
        } else {
            criteria = {_id: this.getObjectId(id)};
            const result = await this._delete(criteria);
            this.propertyChange('remove', [result, id]);
            return result;
        }
    }

    async list(mappings) {
        const entities = await this._list({}, mappings);
        this.propertyChange('list', [{}/*filters*/, mappings]);
        return entities;
    }

    async listByCriteria(criteria, mappings) {
        const entities = await this._list(criteria, mappings);
        this.propertyChange('list', [criteria, mappings]);
        return entities;
    }

    async findAll(options) {
        return this._findAll(options);
    }

    getObjectIdsList(ids) {
        return _.map(ids, this.getObjectId.bind(this));
    }

    _correctCriteria(criteria) {
        if (!criteria) {
            return null;
        }
        if (criteria.hasOwnProperty('_id')) {
            criteria._id = this.getObjectId(criteria._id);
        }
        return criteria;
    }

    getName() {
        return IOC.DB_MANAGER.GENERIC;
    }

    getObjectId(id) {
        if (id instanceof mongo.ObjectID) {
            return id;
        }
        return new mongo.ObjectId(id);
    }

    getReplacedId(isUpsert, result, id) {
        if (!isUpsert) {
            return result.upsertedId ? result.upsertedId._id : null;
        }
        return id;
    }

    /**
     *
     * @param {Object[]} entities
     * @param {MongoId[]} ids
     * @returns {Object[]}
     */
    orderByIds(entities, ids) {
        return this.orderByGenericIds('_id', entities, ids);
    }

    /**
     *
     * @param {string} idKey
     * @param {Object[]} entities
     * @param {MongoId[]} ids
     * @returns {Object[]}
     */
    orderByGenericIds(idKey, entities, ids) {
        return _.map(ids, (id) => {
            let entity;
            _.forEach(entities, (anotherEntity) => {
                if (anotherEntity[idKey].equals(id)) {
                    entity = anotherEntity;
                    return false;
                }
            });
            return entity;
        });
    }

}

module.exports = {
    class: GenericDBManager
};
