define([
    'common/module.transport',
    'utils/service-utils',
    'utils/constants',
    'services/business/game.storage'
], function (Transport, serviceUtils, Constants, gameStorage) {
    'use strict';

    var api;
    var DotApi = Constants.API.DOT;
    var GameApi = Constants.API.GAME;

    function addDot(dot) {
        var game = gameStorage.getGame();
        if (game) {
            return Transport.send(
                {
                    x: dot.x,
                    y: dot.y,
                    gameId: game._id
                },
                DotApi.ADD
            );
        }
    }

    api = {
        listen: {
            addDot: Transport.getDeferredListener(DotApi.ADD),
            gameStep: Transport.getDeferredListener(GameApi.STEP.NEW)
        },
        addDot: addDot
    };

    return api;
});
