'use strict';

const IOC = require('server/constants/ioc.constants');
const GOOGLE_CODE = IOC.AUTH.GOOGLE;
const STRATEGY = 'passport-google-oauth20';
var GenericAuth = require('server/auth/generic.auth_').class;

function GoogleAuth() {

}

GoogleAuth.prototype = Object.create(GenericAuth.prototype);
GoogleAuth.prototype.constructor = GoogleAuth;

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

GoogleAuth.prototype.postConstructor = function postConstructor(ioc) {
    const AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][GOOGLE_CODE];

    this.initDeps(ioc);
    this.initStrategy(STRATEGY, AUTH_CONFIG, GOOGLE_CODE);
    this.initApi(this.server.app);
};

module.exports = {
    class: GoogleAuth
};
