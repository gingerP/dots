define([
    'utils/service-utils',
    'common/backend-events'
], function(ServiceUtils, BackendEvents) {
    'use strict';

    var api;

    api = {
        listen: {
            networkStatusChange: ServiceUtils.createListener(BackendEvents.CLIENT.STATUS.CHANGE)
        }
    };

    return api;
});
