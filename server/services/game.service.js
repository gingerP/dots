'use strict';

var GenericService = require('./generic.service').class;
const IOC = require('server/constants/ioc.constants');
var _ = require('lodash');
var funcUtils = require('server/utils/function-utils');
var logger = require('server/logging/logger').create('GameService');
var Promise = require('bluebird');
var errorLog = funcUtils.error(logger);
var GameScoreUtils = require('server/services/helpers/game-score/game-score-utils');
var CreationUtils = require('server/utils/creation-utils');
var sessionUtils = require('server/utils/session-utils');

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
    var clientId = sessionUtils.getClientId(message.client.getSession());
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

    function loadDataForEvaluation(isValid) {
        if (isValid) {
            opponentId = game.to.equals(client._id) ? game.from : game.to;
            return Promise.all({
                activeGameData: inst.gameDataDBManager.getGameData(gameId, client._id),
                opponentGameData: inst.gameDataDBManager.getGameData(gameId, opponentId),
                opponent: inst.clientsDBManager.get(opponentId)
            }).then((combined) => {
                return inst.gameDataCacheDBManager
                    .getCacheByGameDataId(combined.opponentGameData._id)
                    .then((cache) => {
                        combined.opponentCache = cache;
                        return combined;
                    });
            });
        }
        throw new Error('Invalid gameId or clientId');
    }

    function updateScores(inbound) {
        function combineGameData(scores) {
            return {
                opponent: inbound.opponent,
                gameData: scores.gameData,
                delta: scores.delta,
                loops: scores.loops
            };
        }

        if (isDotValid(dot, inbound.activeGameData.dots)) {
            return GameScoreUtils.getGamersScores(
                dot,
                inbound.activePlayerGameData,
                inbound.opponentGameData,
                inbound.opponentCache
            ).then(combineGameData);
        }
        return Promise.resolve();
    }

    function sendScores(combinedData) {
        if (combinedData) {
            message.callback(combinedData.gameData);
            inst.gameController.nextStep(
                dot,
                CreationUtils.newGamerStepData(
                    client,
                    combinedData.gameData.active,
                    combinedData.delta.active
                ),
                CreationUtils.newGamerStepData(
                    combinedData.opponent,
                    combinedData.gameData.opponent,
                    combinedData.delta.opponent
                ),
                game
            );
        }
        return Promise.resolve();
    }

    function saveGameData(combinedData) {
        if (combinedData) {
            return inst
                .saveScores(combinedData)
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
        .then(loadDataForEvaluation)
        .then(updateScores)
        .then(saveGameData)
        .then(sendScores)
        .catch(errorLog);
};

GameService.prototype.saveScores = function (combineData) {
    var gameData = combineData.gameData;

    return Promise.all([
        this.gameDataCacheDBManager.saveCache(gameData.active._id, combineData.loops),
        this.gameDataDBManager.save(gameData.active),
        this.gameDataDBManager.save(gameData.opponent)
    ]);
};

GameService.prototype.getName = function () {
    return IOC.SERVICE.GAME;
};

GameService.prototype.postConstructor = function (ioc) {
    this.gameController = ioc[IOC.CONTROLLER.GAME];
    this.clientsDBManager = ioc[IOC.DB_MANAGER.CLIENTS];
    this.gameDBManager = ioc[IOC.DB_MANAGER.GAME];
    this.gameDataDBManager = ioc[IOC.DB_MANAGER.GAME_DATA];
    this.gameDataCacheDBManager = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
    this.gameController.onAddDot(this.onAddDot.bind(this));
    this.loopsDBManager = ioc[IOC.DB_MANAGER.LOOPS];
};

module.exports = {
    class: GameService
};

