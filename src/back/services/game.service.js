'use strict';

var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var _ = require('lodash');
var funcUtils = req('src/back/utils/function-utils');
var logger = req('src/js/logger').create('GameService');
var Promise = require('q');
var errorLog = funcUtils.error(logger);
var GameScoreUtils = req('src/back/services/helpers/game-scores-utils');
var sessionUtils = req('src/back/utils/session-utils');

function isGameAndClientValid(data) {
    logger.warn('isGameAndClientValid game: %s, from: %s, to: %s, client: %s',
        data[1].to, data[1].from, data[1].to, data[0]._id);
    return Boolean(data[1]) && Boolean(data[0]) &&
        (data[0]._id.equals(data[1].from) || data[0]._id.equals(data[1].to));
}

function isDotValid(dot, clientDots) {
    return !_.some(clientDots, function(clientDot) {
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
    Promise.all([
        this.clientsDBManager.get(clientId),
        this.gameDBManager.get(gameId)
    ]).then(function(data) {
        client = data[0];
        game = data[1];
        return isGameAndClientValid(data);
    }).then(function(isValid) {
        if (isValid) {
            opponentId = game.to.equals(client._id) ? game.from : game.to;
            return Promise.all([
                inst.gameDataDBManager.getGameData(gameId, client._id),
                inst.gameDataDBManager.getGameData(gameId, opponentId),
                inst.clientsDBManager.get(opponentId)
            ]);
        }
        throw new Error('Invalid gameId or clientId');
    }).then(function(gameData) {
        var clientGameData = gameData[0];
        var opponentGameData = gameData[1];
        var opponent = gameData[2];
        var clientDots = clientGameData.dots;
        var scores;
        var gameCopy;

        if (isDotValid(dot, clientDots)) {
            scores = GameScoreUtils.getGamersScores(dot, clientGameData, opponentGameData);
            game.activePlayer = opponent._id;
            gameCopy = _.cloneDeep(game);

            inst.gameDataDBManager.save(scores.client);
            inst.gameDataDBManager.save(scores.opponent);
            inst.gameDBManager.save(game);
            message.callback(scores);
            inst.gameController.nextStep(
                dot,
                client, scores.client, scores.clientDelta,
                opponent, scores.opponent,
                gameCopy
            );
        }
    }).catch(errorLog);
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

