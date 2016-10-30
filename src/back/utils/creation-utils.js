'use strict';

function newLoopData(dots, trappedDots) {
    return {
        dots: dots || [],
        trappedDots: trappedDots || []
    };
}

function newGameData(gameId, clientId, dots, losingDots, loops) {
    return {
        game: gameId,
        client: clientId,
        dots: dots || [],
        loops: loops || [],
        losingDots: losingDots || []
    };
}

function newClient(connectionId, name, color, created, updated) {
    return {
        connection_id: connectionId,
        created: created || Date.now(),
        updated: updated || Date.now(),
        name: name,
        color: color
    };
}

module.exports = {
    newLoopData: newLoopData,
    newGameData: newGameData,
    newClient: newClient
};
