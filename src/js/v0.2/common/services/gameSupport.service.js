define([
    'utils/service-utils',
    'common/backend-events'
], function(ServiceUtils, BackendEvents) {
    'use strict';

    var api;

    api = {
        listen: {
            networkStatusChange: ServiceUtils.createListener(BackendEvents.GENERAL.CLIENT_NETWORK_STATUS_CHANGED)
        }
    };

    return api;
});
