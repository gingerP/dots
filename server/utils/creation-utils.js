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

/**
 * @param {MongoId} gameDataId - gameDataId
 * @returns {GameDataCache} - new GameDataCache
 */
function newGameDataCache(gameDataId) {
    return {
        gameDataId: gameDataId,
        dotsOutsideLoops: [],
        dotsNotCapturedOpponentDots: [],
        cache: []
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

module.exports = {
    newLoopData: newLoopData,
    newGameData: newGameData,
    newClient: newClient,
    newGamerStepData: newGamerStepData,
    newGameDataCache: newGameDataCache
};
