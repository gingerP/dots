'use strict';

function storeClientId(clientId, session) {
    session.clientId = clientId;
    session.save();
}

function getClientId(session) {
    return session.clientId;
}

module.exports = {
    storeClientId: storeClientId,
    getClientId: getClientId
};
