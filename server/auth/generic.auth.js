'use strict';

const IOC = require('server/constants/ioc.constants');
const SessionUtils = require('server/utils/session-utils');
const _ = require('lodash');
const AuthUtils = require('server/utils/auth-utils');
var Promise = require('bluebird');
const logger = require('server/logging/logger').create('GenericAuth');

function getStrategy(strategy) {
    if (_.isString(strategy)) {
        return require(strategy).Strategy;
    }
    return strategy;
}

function GenericAuth() {

}

GenericAuth.prototype.initDeps = function initDeps(ioc) {
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.clientsDB = ioc[IOC.DB_MANAGER.CLIENTS];
    this.server = ioc[IOC.COMMON.WEB];
    this.CommonAuth = ioc[IOC.AUTH.COMMON];
    this.passport = this.server.passport;
};

GenericAuth.prototype.prepareClient = function prepareClient(profile, accessToken, authCode, client) {
    var preparedClient = client;
    if (!preparedClient) {
        preparedClient = AuthUtils.newClient(profile, accessToken, authCode);
    } else {
        preparedClient = AuthUtils.mergeClient(preparedClient, profile, accessToken, authCode);
    }
    preparedClient.isOnline = true;
    return preparedClient;
};

GenericAuth.prototype.initStrategy = function initStrategy(strategy, authConfig, authCode, prepareClientCallback) {
    var config = {
            clientID: authConfig.CLIENT_ID,
            clientSecret: authConfig.CLIENT_SECRET,
            callbackURL: authConfig.CALLBACK_URL,
            passReqToCallback: true
        },
        clientsDB = this.clientsDB,
        Strategy = getStrategy(strategy),
        prepareClient = prepareClientCallback || this.prepareClient;

    function validateOldClient(id) {
        return clientsDB.get(id).then((client) => {
            if (client && client.auth) {
                logger.debug('Social login from old client(%s - %s)', client.auth.type, client._id);
                return null;
            }
            return id;
        });
    }

    function updateSession(request, calback, preparedClient) {
        return new Promise((resolve) => {
            var oldClientId = SessionUtils.getClientId(request.session);
            validateOldClient(oldClientId).then((validatedClientId) => {
                request.session.regenerate(() => {
                    logger.debug(
                        'Create new session with new client(%s - %s)', preparedClient.auth.type, preparedClient._id);
                    SessionUtils.storeClientsIds(request.session, String(preparedClient._id), validatedClientId);
                    calback(null, preparedClient);
                    resolve(preparedClient);
                });
            });
        });
    }

    function saveClient(client) {
        return clientsDB.save(client).then((id) => {
            client._id = id;
            return client;
        });
    }

    function strategyHandler(request, accessToken, refreshToken, profile, callback) {
        clientsDB
            .getByAuthIdType(profile.id, authCode)
            .then(prepareClient.bind(null, profile, accessToken, authCode))
            .then(saveClient)
            .then(updateSession.bind(null, request, callback))
            .catch(callback);
    }

    this.passport.use(new Strategy(config, strategyHandler));
};

GenericAuth.prototype.getName = function getName() {
    return IOC.AUTH.GENERIC;
};

GenericAuth.prototype.postConstructor = function postConstructor(ioc) {
};

module.exports = {
    class: GenericAuth
};
