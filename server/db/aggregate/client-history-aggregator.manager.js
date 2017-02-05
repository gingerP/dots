'use strict';

var _ = require('lodash');
var CommonUtils = req('server/utils/common-utils');
var Promise = require('bluebird');
var IOC = req('server/constants/ioc.constants');
var funcUtils = req('server/utils/function-utils');
var logger = req('server/logging/logger').create('ClientHistoryAggregateDBManager');
var errorLog = funcUtils.error(logger);
var gameDb;
var gameDataDb;
var clientsDb;

function execAggregation(config, games, db) {
    const COLLECTION = gameDataDb.collectionName;
    return new Promise((resolve, reject) => {
        db[COLLECTION].aggregate(config, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve({
                    gameData: result,
                    games: games
                });
            }
        });
    });
}

function getGamers(games) {
    var gamersIds = [];

    _.forEach(games, (game) => {
        if (gamersIds.indexOf(String(game.from)) < 0) {
            gamersIds.push(game.from);
        }
        if (gamersIds.indexOf(String(game.to)) < 0) {
            gamersIds.push(game.to);
        }
    });

    return clientsDb.get(gamersIds);
}

function getGameDataList(games) {
    var config = [
        {
            $match: {
                game: _.map(CommonUtils.createArray(games), this.getObjectId)
            }
        },
        {
            $project: {
                client: true,
                game: true,
                color: true,
                loops: true,
                dots: {
                    $size: '$dots'
                },
                losingDots: {
                    $size: '$losingDots'
                }
            }
        }
    ];

    return gameDataDb
        .exec()
        .then(execAggregation.bind(null, config, games))
        .then(squeezeGameData);
}

function getSummaryTrappedDots(loops) {
    var sum = 0;

    _.forEach(loops, function(loop) {
        sum += loop.trappedDots.length;
    });

    return sum;
}

function squeezeGameData(gameDataList) {
    _.forEach(gameDataList, (gameData) => {
        gameData.trappedDots = getSummaryTrappedDots(gameData.loops);
        delete gameData.loops;
    });
    return gameDataList;
}

function pickData(data) {
    var gameDataList = data.gameData;
    var gameList = data.games;
    var gamers = data.gamers;
    var gamesMap = {};
    var gamersMap = {};

    _.forEach(gamers, (gamer) => {
        gamersMap[String(gamer._id)] = gamer;
    });

    _.forEach(gameList, (game) => {
        let fromId = String(game.from);
        let toId = String(game.to);
        gamesMap[String(game._id)] = game;
        game.from = gamersMap[fromId];
        game.to = gamersMap[toId];
    });

    _.forEach(gameDataList, (gameData) => {
        let gamerId = String(gameData.client);
        gamersMap[gamerId].gameData = gameData;
    });
}

function postConstructor(ioc) {
    gameDb = ioc[IOC.DB_MANAGER.GAME];
    gameDataDb = ioc[IOC.DB_MANAGER.GAME_DATA];
    clientsDb = ioc[IOC.DB_MANAGER.CLIENTS];
}

function getName() {
    return IOC.DB_MANAGER.CLIENTS_HISTORY_AGGREGATE;
}

function preload(games) {
    return Promise.props({
        games: games,
        gamers: getGamers(games),
        gameDataList: getGameDataList(games)
    });
}

function aggregate(clientId) {
    return gameDb.getGamesForClient(clientId)
        .then(preload)
        .then(pickData)
        .catch(errorLog);
}

module.exports = {
    getName: getName,
    postConstructor: postConstructor,
    /////////////////////////////////////////
    aggregate: aggregate
};
