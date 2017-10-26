define(
    [
        'common/module.transport',
        'utils/constants',
        'services/business/game.storage'
    ],
    /**
     * @typedef {{
     *  listen: {
     *      offerToComplete: function,
     *      offerDraw: function,
     *      gaveUp: function
     *  },
     *  offerToComplete: function,
     *  offerDraw: function,
     *  gaveUp: function
     * }} GameCancelService
     * @param {{Transport}} Transport
     * @param {{BackendEvents}} BackendEvents
     * @returns {{GameCancelService}}
     */

    function (Transport, Constants) {
        'use strict';
        var Cancel = Constants.GAME.CANCEL;
        var GameApi = Constants.API.GAME;
        var DotApi = Constants.API.DOT;

        function offerToComplete() {
            return Transport.send(GameApi.CANCEL, {type: Cancel.COMPLETE});
        }

        function offerDraw() {
            return Transport.send(GameApi.CANCEL, {type: Cancel.DRAW});
        }

        function gaveUp() {
            return Transport.send(GameApi.CANCEL, {type: Cancel.GAVE_UP});
        }

        return {
            listen: {
                offerToComplete: Transport.getDeferredListener(DotApi.ADD),
                offerDraw: Transport.getDeferredListener(GameApi.STEP.NEW),
                gaveUp: Transport.getDeferredListener(GameApi.STEP.NEW)
            },
            offerToComplete: offerToComplete,
            offerDraw: offerDraw,
            gaveUp: gaveUp
        };
    }
);
