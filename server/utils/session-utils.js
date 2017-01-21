'use strict';
const SessionConstants = req('server/constants/session-constants');

function storeClientId(clientId, session) {
    session[SessionConstants.CLIENT_ID] = clientId;
    return session;
}

function getClientId(session) {
    return session[SessionConstants.CLIENT_ID];
}

function getOldClientId(session) {
    return session[SessionConstants.OLD_CLIENT_ID];
}

function stringifyId(clientId) {
    var result;

    if (clientId === null || typeof clientId === 'undefined') {
        result = '';
    } else {
        result = String(clientId);
    }

    return result;
}

function updateSessionWithClients(session, clientId, oldClientId) {
    if (session) {
        session[SessionConstants.CLIENT_ID] = stringifyId(clientId);
        if (oldClientId !== null && typeof oldClientId !== 'undefined') {
            session[SessionConstants.OLD_CLIENT_ID] = stringifyId(oldClientId);
        }
    }
    return session;
}

module.exports = {
    storeClientId: storeClientId,
    getClientId: getClientId,
    getOldClientId: getOldClientId,
    storeClientsIds: updateSessionWithClients
};
