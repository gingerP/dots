define([
    'business/game.storage'
], function(gameStorage) {
    'use strict';

    var api;

    function hasPlayersDots() {
        var ids = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        return [gameStorage.opponent, gameStorage.activePlayer].some(function (player) {
            return ids.every(function (id) {
                return player.hasDot(id);
            });
        })
    }

    api = {
        isGameStarted: function isGameStarted() {
            return !!gameStorage.opponent;
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
            return [gameStorage.opponent, gameStorage.activePlayer].some(function (player) {
                return player.hasDot(data1) && player.hasDot(data2);
            });
        },

        isDotsBelongsToActivePlayer: function isDotsBelongsToActivePlayer(data1, data2) {
            return gameStorage.activePlayer.hasDot(data1) && gameStorage.activePlayer.hasDot(data2);
        },

        isActivePlayerSelectDot: function isActivePlayerSelectDot() {
            return gameStorage.activePlayer.history.hasDots();
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
        function() {
            return !api.isActivePlayerSelectDot.apply(api, arguments);
        }
    ];

    return api;
});