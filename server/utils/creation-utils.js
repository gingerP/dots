'use strict';

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

module.exports = {
    newLoopData: newLoopData,
    newGameData: newGameData,
    newClient: newClient
};
