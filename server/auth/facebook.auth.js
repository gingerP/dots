'use strict';

const IOC = require('server/constants/ioc.constants');
const FACEBOOK_CODE = IOC.AUTH.FACEBOOK;
const STRATEGY = 'passport-facebook';
var GenericAuth = require('server/auth/generic.auth').class;

function FacebookAuth() {

}

FacebookAuth.prototype = Object.create(GenericAuth.prototype);
FacebookAuth.prototype.constructor = FacebookAuth;

FacebookAuth.prototype.initApi = function initApi(app) {
    app.get('/auth/facebook',
        this.passport.authenticate('facebook', {scope: ['profile', 'email']}));

    app.get('/auth/facebook/callback',
        this.passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/'})
    );
};

FacebookAuth.prototype.getName = function getName() {
    return FACEBOOK_CODE;
};

FacebookAuth.prototype.postConstructor = function postConstructor(ioc) {
    const AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][FACEBOOK_CODE];

    this.initDeps(ioc);
    this.initStrategy(STRATEGY, AUTH_CONFIG, FACEBOOK_CODE);
    this.initApi(this.server.app);
};

module.exports = {
    class: FacebookAuth
};
