'use strict';

const CreationUtils = require('./creation-utils');
const _ = require('lodash');

function newAuth(authType, profile, accessToken) {
    return {
        type: authType,
        id: profile.id,
        token: accessToken
    };
}

function newClient(profile, accessToken, authCode) {
    var client = CreationUtils.newClient(profile.displayName);

    client.icon = _.get(profile, 'photos[0].value');
    client.email = _.get(profile, 'emails[0].value');
    client.auth = newAuth(
        authCode,
        profile,
        accessToken
    );

    return client;
}

function mergeClient(client, profile, accessToken, authCode) {
    _.extend(client, {
        name: profile.displayName,
        icon: _.get(profile, 'photos[0].value'),
        email: _.get(profile, 'emails[0].value'),
        auth: newAuth(
            authCode,
            profile,
            accessToken
        )
    });
    return client;
}

module.exports = {
    newClient: newClient,
    mergeClient: mergeClient
};
