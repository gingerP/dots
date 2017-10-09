define([
    'lodash',
    'services/business/domains/Player',
    'services/business/game.storage'
], function (_, Player, GameStorage) {
    'use strict';

    function updatePlayerTrappedDots(/*id, trappedDots*/) {

    }

    function setPlayerState(playerId, state) {
        var player = GameStorage.getGamePlayerById(playerId);
        if (player) {
            player.addDots(state.dots).addLoops(state.loops).addTrappedDots(state.trappedDots);
            player.newStep();
        }
    }

	/**
     *
	 * @param playerId
	 * @param {Dot} dot
	 * @param {Dot[][]} loops
	 * @param {Dot[]} capturedDots
	 * @param {Dot[]} losingDots
	 */
    function updatePlayerState(playerId, dot, loops, capturedDots, losingDots) {
        var player = GameStorage.getGamePlayerById(playerId);
        if (player) {
            player
                .addDots([dot])
                .addLoops(loops)
                .addTrappedDots(capturedDots)
                .addLosingDots(losingDots)
                .newStep();
        }
    }

    function createNewPlayer(id, name, color, style) {
        return new Player().init({
            id: id,
            name: name,
            color: color,
            style: style
        });
    }

    function generateVertexes(xSize, ySize) {
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
