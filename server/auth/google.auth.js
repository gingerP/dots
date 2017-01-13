'use strict';

const IOC = req('server/constants/ioc.constants');
const GOOGLE_CODE = IOC.AUTH.GOOGLE;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AuthUtils = req('server/utils/auth-utils');
const SessionUtils = req('server/utils/session-utils');
var Promise = require('bluebird');
function GoogleAuth() {

}

GoogleAuth.prototype.initStrategy = function initStrategy() {
    var config = {
            clientID: this.AUTH_CONFIG.CLIENT_ID,
            clientSecret: this.AUTH_CONFIG.CLIENT_SECRET,
            callbackURL: this.AUTH_CONFIG.CALLBACK_URL,
            passReqToCallback: true
        },
        clientsDB = this.clientsDB,
        inst = this;

    function prepareClient(profile, accessToken, client) {
        var preparedClient = client;
        if (!preparedClient) {
            preparedClient = AuthUtils.newGoogleClient(profile, accessToken);
        } else {
            preparedClient = AuthUtils.mergeGoogleClient(preparedClient, profile, accessToken);
        }
        preparedClient.isOnline = true;
        return preparedClient;
    }

    function updateSession(request, calback, preparedClient) {
        return new Promise((resolve) => {
            var oldClientId = SessionUtils.getClientId(request.session);
            request.session.regenerate(() => {
                inst.CommonAuth.updateSessionClientId(request, String(preparedClient._id), oldClientId);
                calback(null, preparedClient);
                resolve(preparedClient);
            });
        });
    }

    function saveClient(client) {
        return clientsDB.save(client).then((id) => {
            client._id = id;

            return client;
        });
    }

    this.passport.use(new GoogleStrategy(
        config,
        (request, accessToken, refreshToken, profile, callback) => {
            clientsDB
                .getByAuthIdType(profile.id, GOOGLE_CODE)
                .then(prepareClient.bind(null, profile, accessToken))
                .then(saveClient)
                .then(updateSession.bind(null, request, callback))
                .catch(callback);
        }
    ));
};

GoogleAuth.prototype.initApi = function initApi(app) {
    app.get('/auth/google',
        this.passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',
        this.passport.authenticate('google', {successRedirect: '/', failureRedirect: '/'})
    );
};

GoogleAuth.prototype.getName = function getName() {
    return GOOGLE_CODE;
};

GoogleAuth.prototype.postConstructor = function (ioc) {
    this.AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][GOOGLE_CODE];
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.clientsDB = ioc[IOC.DB_MANAGER.CLIENTS];
    this.server = ioc[IOC.COMMON.WEB];
    this.CommonAuth = ioc[IOC.AUTH.COMMON];
    this.passport = this.server.passport;
    this.initStrategy();
    this.initApi(this.server.app);
};

module.exports = {
    class: GoogleAuth
};
