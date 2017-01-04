'use strict';

const IOC = req('server/constants/ioc.constants');
const GOOGLE_CODE = IOC.AUTH.GOOGLE;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const CreationUtils = req('server/utils/creation-utils');
const SessionUtils = req('server/utils/session-utils');

function GoogleAuth() {

}

GoogleAuth.prototype.initStrategy = function initStrategy() {
    this.passport.use(new GoogleStrategy({
            clientID: this.AUTH_CONFIG.CLIENT_ID,
            clientSecret: this.AUTH_CONFIG.CLIENT_SECRET,
            callbackURL: this.AUTH_CONFIG.CALLBACK_URL,
            passReqToCallback: true
        },
        (request, accessToken, refreshToken, profile, calback) => {
            this.clientsDB
                .getByAuthIdType(profile.id, GOOGLE_CODE)
                .then((client) => {
                    var newClient;
                    if (!client) {
                        newClient = CreationUtils.newGoogleClient(profile, accessToken);
                        newClient.isOnline = true;
                        return this.clientsDB.save(newClient).then((id) => {
                            SessionUtils.storeClientId(String(id));
                            calback(null, newClient);
                        });
                    }
                    SessionUtils.storeClientId(String(client._id));
                    return calback(null, client);
                }).catch(calback);
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
    return IOC.AUTH.GOOGLE;
};

GoogleAuth.prototype.postConstructor = function (ioc) {
    this.AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][GOOGLE_CODE];
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.clientsDB = ioc[IOC.DB_MANAGER.CLIENTS];
    this.server = ioc[IOC.COMMON.WEB];
    this.passport = this.server.passport;
    this.initStrategy();
    this.initApi(this.server.app);
};

module.exports = {
    class: GoogleAuth
};
