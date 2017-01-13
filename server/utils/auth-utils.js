'use strict';

const CreationUtils = require('./creation-utils');
const IOC = req('server/constants/ioc.constants');
const _ = require('lodash');

function newAuth(authType, profile, accessToken) {
    return {
        type: authType,
        id: profile.id,
        token: accessToken
    };
}

function newGoogleClient(profile, accessToken) {
    var client = CreationUtils.newClient(profile.displayName);

    client.icon = _.get(profile, 'photos[0].value');
    client.email = _.get(profile, 'emails[0].value');
    client.auth = newAuth(
        IOC.AUTH.GOOGLE,
        profile,
        accessToken
    );

    return client;
}

function mergeGoogleClient(client, profile, accessToken) {
    _.extend(client, {
        name: profile.displayName,
        icon: _.get(profile, 'photos[0].value'),
        email: _.get(profile, 'emails[0].value'),
        auth: newAuth(
            IOC.AUTH.GOOGLE,
            profile,
            accessToken
        )
    });
    return client;
}

function newVkClient(profile, accessToken) {
    var client = CreationUtils.newClient(profile.displayName);

    client.icon = _.get(profile, 'photos[0].value');
    client.email = _.get(profile, 'emails[0].value');
    client.auth = newAuth(
        IOC.AUTH.VK,
        profile,
        accessToken
    );

    return client;
}

function mergeVkClient(client, profile, accessToken) {
    _.extend(client, {
        name: profile.displayName,
        icon: _.get(profile, 'photos[0].value'),
        email: _.get(profile, 'emails[0].value'),
        auth: newAuth(
            IOC.AUTH.VK,
            profile,
            accessToken
        )
    });
    return client;
}

module.exports = {
    newGoogleClient: newGoogleClient,
    mergeGoogleClient: mergeGoogleClient,

    newVkClient: newVkClient,
    mergeVkClient: mergeVkClient
};
