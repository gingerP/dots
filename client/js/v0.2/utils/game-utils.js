define([
    'lodash',
    'business/domains/Player',
    'business/game.storage'
], function (_, Player, GameStorage) {
    'use strict';

    function updatePlayerTrappedDots(id, trappedDots) {

    }

    function setPlayerState(playerId, state) {
        var player = GameStorage.getGamePlayerById(playerId);
        if (player) {
            player.addDots(state.dots).addLoops(state.loops).addTrappedDots(state.trappedDots);
            player.newStep();
        }
    }

    function updatePlayerState(playerId, state) {
        var player = GameStorage.getGamePlayerById(playerId);
        var trappedDots;

        if (player) {
            trappedDots = collectTrappedDots(state.loops);
            player
                .addDots(state.dots)
                .addLoops(state.loops)
                .addTrappedDots(trappedDots)
                .addLosingDots(state.losingDots);
            player.newStep();
        }
    }

    function createNewPlayer(id, name, color, style) {
        return new Player().init(id, name, color, style);
    }

    function generateVertexes(xSize, ySize, radius) {
        var data = [];
        var w;
        var h;
        for (w = 0; w < xSize; w++) {
            for (h = 0; h < ySize; h++) {
                data.push({
                    x: w,
                    y: h
                });
            }
        }
        return data;
    }

    function collectTrappedDots(loops) {
        var result = [];

        _.forEach(loops, function collect(loopData) {
            result.push.apply(result, loopData.trappedDots);
        });

        return result;
    }

    return {
        generateVertexes: generateVertexes,
        createNewPlayer: createNewPlayer,
        updatePlayerTrappedDots: updatePlayerTrappedDots,
        updatePlayerState: updatePlayerState,
        setPlayerState: setPlayerState,
        collectTrappedDots: collectTrappedDots
    };
});
