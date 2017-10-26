define([
    'utils/service-utils',
    'utils/constants'
], function(ServiceUtils, Constants) {
    'use strict';

    var api;
    var ClientApi = Constants.API.CLIENT;

    api = {
        listen: {
            networkStatusChange: ServiceUtils.createListener(ClientApi.STATUS.CHANGE)
        }
    };

    return api;
});
