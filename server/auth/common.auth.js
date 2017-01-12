'use strict';

var _ = require('lodash');
const IOC = req('server/constants/ioc.constants');
const SessionConstants = req('server/constants/session-constants');

function CommonAuth() {

}

CommonAuth.prototype.updateSessionClientId = function (request, clientId) {
    _.extend(request.session, {
        [SessionConstants.CLIENT_ID]: clientId
    });
    request.session.save();
};

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
/*    ws.use(passportSocketIo.authorize({
        key: config.key, // make sure is the same as in your session settings in app.js
        secret: config.secret, // make sure is the same as in your session settings in app.js
        passport: server.passport,
        store: config.store // you need to use the same sessionStore you defined in the app.use(session({... in app.js
    }));

    ws.use(passportSocketIo.authorize({
        name: 'connect.sid',       // make sure is the same as in your session settings in app.js
        secret: 'keyboard cat',      // make sure is the same as in your session settings in app.js
        passport: this.passport,
        store: server.store        // you need to use the same sessionStore you defined in the app.use(session({... in app.js
    }));*/
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
