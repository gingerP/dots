define([
    'common/module.transport',
    'utils/service-utils',
    'common/backend-events',
    'services/business/game.storage'
], function (Transport, serviceUtils, BackendEvents, gameStorage) {
    'use strict';

    var api;

    function addDot(dot) {
        var game = gameStorage.getGame();
        if (game) {
            return Transport.send(
                {
                    x: dot.x,
                    y: dot.y,
                    gameId: game._id
                },
                BackendEvents.DOT.ADD
            );
        }
    }

    api = {
        listen: {
            addDot: serviceUtils.createListener(BackendEvents.DOT.ADD),
            gameStep: serviceUtils.createListener(BackendEvents.GAME.STEP.NEW)
        },
        addDot: addDot
    };

    return api;
});