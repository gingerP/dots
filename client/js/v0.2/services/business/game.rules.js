define([
    'business/game.storage',
    'lodash'
], function(gameStorage, _) {
    'use strict';

    var api;

    function hasPlayersDots() {
        var args = arguments;
        return gameStorage.getGamePlayers().some(function (player) {
            return _.every(args, function (dot) {
                return player.hasDot(dot);
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
            return !hasPlayersDots(data);
        },

        isDotsNeighbors: function isDotsNeighbors(data1, data2) {
            return Math.abs(data1.x - data2.x) <= 1
                && Math.abs(data1.y - data2.y) <= 1;
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
            return gameStorage.getActiveGamePlayer().hasStepDot();
        },

        isActivePlayerLeadRoundTrappedDots: function isActivePlayerLeadRoundTrappedDots() {
            return true;
        }
    };

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

    api.rulesCanSelect = [
        api.isGameStarted,
        api.isDotFree,
        api.isActivePlayerIsMyself,
        function isActivePlayerDidNotSelectDot() {
            return !api.isActivePlayerSelectDot();
        }
    ];

    return api;
});
