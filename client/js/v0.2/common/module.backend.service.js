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
            return Transport.send(client, BackendEvents.CLIENT.RECONNECT);
        },
        newClient: function() {
            return Transport.send({}, BackendEvents.CLIENT.NEW);
        },
        getId: function() {
          return Transport.getId();
        }
    };

    return api;
});
