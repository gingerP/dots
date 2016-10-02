define([
    'business/game.storage',
    'lodash'
], function(gameStorage, _) {
    'use strict';

    var api;

    function hasPlayersDots() {
        return gameStorage.getGamePlayers().some(function (player) {
            return _.every(arguments, function (id) {
                return player.hasDot(id);
            });
        });
    }

    api = {
        isActivePlayerIsMyself: function isActivePlayerIsMyself() {
            return gameStorage.getActiveGamePlayer() === gameStorage.getGameClient();
        },
        isGameStarted: function isGameStarted() {
            return gameStorage.hasOpponent();
        },

        isDotFree: function isDotFree(data) {
            return !hasPlayersDots(data.id);
        },

        isDotsNeighbors: function isDotsNeighbors(data1, data2) {
            return Math.abs(data1.xInd - data2.xInd) <= 1
                && Math.abs(data1.yInd - data2.yInd) <= 1;
        },

        isDotsSelected: function isDotsSelected(data1, data2) {
            return hasPlayersDots(data1, data2);
        },

        isDotsBelongsToOnePlayer: function isDotsBelongsToOnePlayer(data1, data2) {
            return gameStorage.getGamePlayers().some(function (player) {
                return player.hasDot(data1) && player.hasDot(data2);
            });
        },

        isDotsBelongsToActivePlayer: function isDotsBelongsToActivePlayer(data1, data2) {
            var client = gameStorage.getActiveGamePlayer();
            return client.hasDot(data1) && client.hasDot(data2);
        },

        isActivePlayerSelectDot: function isActivePlayerSelectDot() {
            return gameStorage.getActiveGamePlayer().history.hasDots();
        },

        isActivePlayerLeadRoundTrappedDots: function isActivePlayerLeadRoundTrappedDots() {
            return true;
        }
    };

    /**
     * args - data1, data2
     * @type {Array}
     */
    api.rulesCanConnect = [
        api.isDotsNeighbors,
        api.isDotsSelected,
        api.isDotsBelongsToOnePlayer,
        api.isDotsBelongsToActivePlayer
    ];
    api.rulesCanChangeActivePlayer = [
        api.isActivePlayerSelectDot,
        api.isActivePlayerLeadRoundTrappedDots
    ];

    /**
     * args - data
     * @type {Array}
     */
    api.rulesCanSelect = [
        api.isGameStarted,
        api.isDotFree,
        api.isActivePlayerIsMyself,
        function() {
            return !api.isActivePlayerSelectDot.apply(api, arguments);
        }
    ];

    return api;
});
