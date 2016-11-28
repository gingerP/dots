'use strict';

function storeClientId(clientId, connection) {
    connection.setExtendData({
        clientId: clientId
    });
}

function getClientId(connection) {
    var data = connection.getExtendData();
    return data ? data.clientId : null;
}

module.exports = {
    storeClientId: storeClientId,
    getClientId: getClientId
};
