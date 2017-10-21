define(
    [
        'common/module.transport',
        'utils/service-utils',
        'common/backend-events',
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
     * @param {{ServiceUtils}}
     * @param {{BackendEvents}} BackendEvents
     * @returns {{GameCancelService}}
     */

    function (Transport, BackendEvents) {
        'use strict';

        function offerToComplete() {
            return Transport.send(BackendEvents.GAME.CANCEL.OFFER_COMPLETE);
        }

        function offerDraw() {
            return Transport.send(BackendEvents.GAME.CANCEL.OFFER_DRAW);
        }

        function gaveUp() {
            return Transport.send(BackendEvents.GAME.CANCEL.GAVE_UP);
        }

        return {
            listen: {
                offerToComplete: Transport.getListenerTrap(BackendEvents.DOT.ADD),
                offerDraw: Transport.getListenerTrap(BackendEvents.GAME.STEP.NEW),
                gaveUp: Transport.getListenerTrap(BackendEvents.GAME.STEP.NEW)
            },
            offerToComplete: offerToComplete,
            offerDraw: offerDraw,
            gaveUp: gaveUp
        };
    }
);
