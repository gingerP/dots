'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var _ = require('lodash');
var funcUtils = req('server/utils/function-utils');
var logger = req('server/logging/logger').create('GameService');
var Promise = require('q');
var errorLog = funcUtils.error(logger);
var GameScoreUtils = req('server/services/helpers/game-scores-utils');
var sessionUtils = req('server/utils/session-utils');

function isGameAndClientValid(data) {
    logger.warn('isGameAndClientValid game: %s, from: %s, to: %s, client: %s',
        data[1].to, data[1].from, data[1].to, data[0]._id);
    return Boolean(data[1]) && Boolean(data[0]) &&
        (data[0]._id.equals(data[1].from) || data[0]._id.equals(data[1].to));
}

function isDotValid(dot, clientDots) {
    return !_.some(clientDots, function (clientDot) {
        return clientDot.x === dot.x && clientDot.y === dot.y;
    });
}

function GameService() {
}

GameService.prototype = Object.create(GenericService.prototype);
GameService.prototype.constructor = GameService;

GameService.prototype.onAddDot = function (message) {
    var inst = this;
    var gameId = message.data.extend.gameId;
    var clientId = sessionUtils.getClientId(message.client);
    var dot = {
        x: message.data.extend.x,
        y: message.data.extend.y
    };
    var game;
    var client;
    var opponentId;

    function validateInboundData(data) {
        client = data[0];
        game = data[1];
        return isGameAndClientValid(data);
    }

    function handleValidation(isValid) {
        if (isValid) {
            opponentId = game.to.equals(client._id) ? game.from : game.to;
            return Promise.all([
                inst.gameDataDBManager.getGameData(gameId, client._id),
                inst.gameDataDBManager.getGameData(gameId, opponentId),
                inst.clientsDBManager.get(opponentId)
            ]);
        }
        throw new Error('Invalid gameId or clientId');
    }

    function updateScores(gameData) {
        var activePlayerGameData = gameData[0];
        var opponentGameData = gameData[1];
        var opponent = gameData[2];
        var activePlayerDots = activePlayerGameData.dots;

        function combineGameData(scores) {
            return {
                opponent: opponent,
                gameData: scores
            };
        }

        if (isDotValid(dot, activePlayerDots)) {
            return GameScoreUtils.getGamersScores(dot, activePlayerGameData, opponentGameData)
                .then(combineGameData);
        }
        return Promise.resolve();
    }

    function sendScores(combinedData) {
        if (combinedData) {
            message.callback(combinedData.gameData);

            inst.gameController.nextStep(
                dot,
                client, combinedData.gameData.activePlayerGameData, combinedData.gameData.delta,
                combinedData.opponent, combinedData.gameData.opponentPlayerGameData,
                game
            );
        }
        return Promise.resolve();
    }

    function saveGameData(combinedData) {
        if (combinedData) {
            return inst
                .saveScores(combinedData.gameData)
                .then(function () {
                    game.activePlayer = combinedData.opponent._id;
                    return inst.gameDBManager.save(game);
                })
                .then(function () {
                    return combinedData;
                });
        }
        return Promise.resolve();
    }

    return Promise
        .all([
            this.clientsDBManager.get(clientId),
            this.gameDBManager.get(gameId)
        ])
        .then(validateInboundData)
        .then(handleValidation)
        .then(updateScores)
        .then(saveGameData)
        .then(sendScores)
        .catch(errorLog);
};

GameService.prototype.saveScores = function (scores) {
    return this.gameDataDBManager.save(scores.activePlayerGameData).then(() => {
        return this.gameDataDBManager.save(scores.opponentPlayerGameData);
    });
};

GameService.prototype.getName = function () {
    return constants.GAME_SERVICE;
};

GameService.prototype.postConstructor = function (ioc) {
    this.gameController = ioc[constants.GAME_CONTROLLER];
    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
    this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    this.gameDataDBManager = ioc[constants.GAME_DATA_DB_MANAGER];
    this.gameController.onAddDot(this.onAddDot.bind(this));
    this.loopsDBManager = ioc[constants.LOOPS_DB_MANAGER];
};

module.exports = {
    class: GameService
};
