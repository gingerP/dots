'use strict';

const IOC = req('server/constants/ioc.constants');
const VK_CODE = IOC.AUTH.VK;
const STRATEGY = 'passport-vkontakte';
var GenericAuth = req('server/auth/generic.auth').class;

function VkAuth() {

}

VkAuth.prototype = Object.create(GenericAuth.prototype);
VkAuth.prototype.constructor = VkAuth;

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

VkAuth.prototype.postConstructor = function postConstructor(ioc) {
    const AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][VK_CODE];

    this.initDeps(ioc);
    this.initStrategy(STRATEGY, AUTH_CONFIG, VK_CODE);
    this.initApi(this.server.app);
};

module.exports = {
    class: VkAuth
};
