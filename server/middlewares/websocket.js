'use strict';

const Ioc = require('./../constants/ioc.constants');
const SessionsUtils = require('./../utils/session-utils');

module.exports = function (iocContainer) {
    const wssServer = iocContainer[Ioc.COMMON.WSS];
    const UsersDb = iocContainer[Ioc.DB_MANAGER.CLIENTS];
    wssServer.use(async (socketMessage) => {
        const clientId = SessionsUtils.getClientId(socketMessage.client.getSession());
        if (clientId) {
            socketMessage.user = await UsersDb.get(clientId);
        }
    });
};