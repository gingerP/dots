'use strict';

function storeClientId(clientId, session) {
    session.clientId = clientId;
}

function getClientId(session) {
    return session.clientId;
}

module.exports = {
    storeClientId: storeClientId,
    getClientId: getClientId
};
