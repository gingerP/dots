define([
    'common/module.transport',
    'common/backend-events'
], function(Transport, BackendEvents) {
    'use strict';

    var api;

    function listen(type, listener) {
        Transport.addListener(type, listener);
    }

    function getMyself() {
        return Transport.getMyself();
    }

    api = {
        on: listen,
        listen: {},
        getMyself: getMyself,
        clientReconnect: function(client) {
            return Transport.send(client, BackendEvents.GENERAL.CLIENT_RECONNECT);
        },
        newClient: function() {
            return Transport.send({}, BackendEvents.GENERAL.NEW_CLIENT);
        },
        getId: function() {
          return Transport.getId();
        }
    };

    return api;
});
