define([
    'module.storage'
], function (storage) {
    'use strict';

    return {
        getOpponent: function () {
            var result;
            var game = storage.getGame();
            var opponent = storage.getOpponent();
            if (game && opponent && (opponent._id === game.from || opponent._id === game.to)) {
                result = opponent;
            }
            return result;
        }
    }
});