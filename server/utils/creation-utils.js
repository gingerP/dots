'use strict';
const IOC = req('server/constants/ioc.constants');
const _ = require('lodash');

function newLoopData(dots, trappedDots) {
    return {
        dots: dots || [],
        trappedDots: trappedDots || []
    };
}

function newGameData(gameId, clientId, dots, losingDots, loops, color) {
    return {
        game: gameId,
        client: clientId,
        dots: dots || [],
        loops: loops || [],
        losingDots: losingDots || [],
        color: color
    };
}

function newClient(name, created, updated, isOnline) {
    return {
        created: created || Date.now(),
        updated: updated || Date.now(),
        isOnline: Boolean(isOnline),
        name: name
    };
}

function newGamerStepData(gamer, gameData, gameDataDelta) {
    return {
        gamer: gamer,
        gameData: gameData,
        delta: gameDataDelta
    };
}

function newGoogleClient(profile, accessToken) {
    var client = newClient(profile.displayName);

    client.email = _.get(profile, 'emails[0].value');
    client.auth = newAuth(
        IOC.AUTH.GOOGLE,
        profile,
        accessToken
    );

    return client;
}

function newAuth(authType, profile, accessToken) {
    return {
        type: authType,
        id: profile.id,
        token: accessToken
    };
}

module.exports = {
    newLoopData: newLoopData,
    newGameData: newGameData,
    newClient: newClient,
    newGoogleClient: newGoogleClient,
    newGamerStepData: newGamerStepData
};
