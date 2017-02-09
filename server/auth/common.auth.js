'use strict';

const IOC = require('server/constants/ioc.constants');
const SessionUtils = require('server/utils/session-utils');
var logger = require('server/logging/logger').create('CommonAuth');

function CommonAuth() {

}

CommonAuth.prototype.init = function initApi(server, ws) {
    function isLogin(request, response, next) {
        if (request.isAuthenticated()) {
            next();
        }

        // if they aren't redirect them to the home page
        response.redirect('/');
    }

    // used to serialize the user for the session
    server.passport.serializeUser(function (user, done) {
        done(null, String(user._id));
    });

    // used to deserialize the user
    server.passport.deserializeUser((id, done) => {
        this.clienstDB.get(id).then(function (user) {
            done(null, user);
        }).catch(done);
    });

    let config = server.sessionConfig;
    // route for logging out
    server.app.get('/logout', (req, res) => {
        var oldClientId = SessionUtils.getOldClientId(req.session);
        req.session.regenerate((error) => {
            if (error) {
                logger.error(error);
            }
            let newClientId = oldClientId;
            SessionUtils.storeClientsIds(req.session, newClientId);
            res.redirect('/');
        });
    });
};

CommonAuth.prototype.getName = function getName() {
    return IOC.AUTH.COMMON;
};

CommonAuth.prototype.postConstructor = function (ioc) {
    var server = ioc[IOC.COMMON.WEB];
    var ws = ioc[IOC.COMMON.WSS].ws;
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.passport = ioc[IOC.COMMON.PASSPORT];
    this.clienstDB = ioc[IOC.DB_MANAGER.CLIENTS];
    this.init(server, ws);
};

module.exports = {
    class: CommonAuth
};
