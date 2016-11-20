define([
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events',
    'business/game.storage'
], function(Transport, serviceUtils, BackendEvents, gameStorage) {
    'use strict';

    var api;

    function addDot(dot) {
        var game = gameStorage.getGame();
        if (game) {
            Transport.send(
                serviceUtils.createGamePack(BackendEvents.GAME.ADD_DOT, {
                    x: dot.x,
                    y: dot.y,
                    gameId: game._id
                }),
                BackendEvents.GAME.ADD_DOT
            );
        }
    }

    api = {
        listen: {
            addDot: serviceUtils.createListener(BackendEvents.GAME.ADD_DOT),
            gameStep: serviceUtils.createListener(BackendEvents.GAME.GAME_STEP)
        },
        addDot: addDot
    };

    return api;
});
