define([
    'lodash',
    'business/game.storage'
], function (_, GameStorage) {
    'use strict';

    function updatePlayersColorsFromGameData() {
        var myself = GameStorage.getGameClient();
        var opponent = GameStorage.getGameOpponent();

        function updateColor(gameData) {
            if (gameData.client === myself.getId()) {
                myself.color = gameData.color;
            } else if (opponent && gameData.client === opponent.getId()) {
                opponent.color = gameData.color;
            }
        }

        _.forEach(arguments, updateColor);
    }

    return {
        updatePlayersColorsFromGameData: updatePlayersColorsFromGameData
    };
});
