'use strict';

const IOC = req('server/constants/ioc.constants');
const VK_CODE = IOC.AUTH.VK;
const VkStrategy = require('passport-vkontakte').Strategy;
const AuthUtils = req('server/utils/auth-utils');
const SessionUtils = req('server/utils/session-utils');
var Promise = require('bluebird');
function VkAuth() {

}

VkAuth.prototype.initStrategy = function initStrategy() {
    var clientsDB = this.clientsDB,
        inst = this;

    function prepareClient(profile, accessToken, client) {
        var preparedClient = client;
        if (!preparedClient) {
            preparedClient = AuthUtils.newVkClient(profile, accessToken);
        } else {
            preparedClient = AuthUtils.mergeVkClient(preparedClient, profile, accessToken);
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

    this.passport.use(new VkStrategy(
        {
            clientID: this.AUTH_CONFIG.CLIENT_ID,
            clientSecret: this.AUTH_CONFIG.CLIENT_SECRET,
            callbackURL: this.AUTH_CONFIG.CALLBACK_URL,
            passReqToCallback: true
        },
        (request, accessToken, refreshToken, params, profile, callback) => {
            clientsDB
                .getByAuthIdType(profile.id, VK_CODE)
                .then(prepareClient.bind(null, profile, accessToken))
                .then(saveClient)
                .then(updateSession.bind(null, request, callback))
                .catch(callback);
        }
    ));
};

VkAuth.prototype.initApi = function initApi(app) {
    app.get('/auth/vk',
        this.passport.authenticate('vkontakte', {scope: ['profile', 'email']}));

    app.get('/auth/vk/callback',
        this.passport.authenticate('vkontakte', {successRedirect: '/', failureRedirect: '/'})
    );
};

VkAuth.prototype.getName = function getName() {
    return VK_CODE;
};

VkAuth.prototype.postConstructor = function (ioc) {
    this.AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][VK_CODE];
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.clientsDB = ioc[IOC.DB_MANAGER.CLIENTS];
    this.server = ioc[IOC.COMMON.WEB];
    this.CommonAuth = ioc[IOC.AUTH.COMMON];
    this.passport = this.server.passport;
    this.initStrategy();
    this.initApi(this.server.app);
};

module.exports = {
    class: VkAuth
};
