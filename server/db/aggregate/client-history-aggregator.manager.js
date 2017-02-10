'use strict';

var _ = require('lodash');
var CommonUtils = require('server/utils/common-utils');
var Promise = require('bluebird');
var IOC = require('server/constants/ioc.constants');
var funcUtils = require('server/utils/function-utils');
var logger = require('server/logging/logger').create('ClientHistoryAggregateDBManager');
var errorLog = funcUtils.error(logger);
var gameDb;
var gameDataDb;
var clientsDb;

function execAggregation(config, games, db) {
    const COLLECTION = gameDataDb.collectionName;
    return new Promise((resolve, reject) => {
        db.collection(COLLECTION).aggregate(config, function (error, result) {
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
                game: {
                    $in: _.map(CommonUtils.createArray(games), (game) => {
                        return game._id;
                    })
                }
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

    _.forEach(loops, function (loop) {
        sum += loop.trappedDots.length;
    });

    return sum;
}

function squeezeGameData(gameDataPack) {
    _.forEach(gameDataPack.gameData, (gameData) => {
        gameData.trappedDots = getSummaryTrappedDots(gameData.loops);
        delete gameData.loops;
    });
    return gameDataPack.gameData;
}

function preparePack(pack) {
    return new Promise(function(resolve) {
        pack.gamersMap = {};
        pack.gamesMap = {};

        _.forEach(pack.gamers, (gamer) => {
            pack.gamersMap[String(gamer._id)] = gamer;
        });
        _.forEach(pack.games, (game) => {
            pack.gamesMap[String(game._id)] = game;
        });
        resolve(pack);
    });
}

function fillGamesWithClients(pack) {
    return new Promise(function(resolve) {
        _.forEach(pack.games, (game) => {
            let fromId = String(game.from);
            let toId = String(game.to);
            pack.gamesMap[String(game._id)] = game;
            game.from = _.cloneDeep(pack.gamersMap[fromId]);
            game.to = _.cloneDeep(pack.gamersMap[toId]);
        });
        resolve(pack);
    });
}

function fillClientsWithGameData(pack) {
    return new Promise(function(resolve) {
        _.forEach(pack.gameDataList, (gameData) => {
            let gamerId = String(gameData.client);
            let gameId = String(gameData.game);
            let fromId = String(pack.gamesMap[gameId].from._id);
            let toId = String(pack.gamesMap[gameId].to._id);

            if (fromId === gamerId) {
                pack.gamesMap[gameId].from.gameData = gameData;
            } else if (toId === gamerId) {
                pack.gamesMap[gameId].to.gameData = gameData;
            }
        });
        resolve(pack);
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
    var isEmpty = !games.length;

    return Promise.props({
        games: games,
        gamers: isEmpty ? [] : getGamers(games),
        gameDataList: isEmpty ? [] : getGameDataList(games)
    });
}

function pickData(data) {
    var gameList = data.games || [];

    function returnGames(pack) {
        return pack.games;
    }

    if (gameList.length) {
        return preparePack(data)
            .then(fillGamesWithClients)
            .then(fillClientsWithGameData)
            .then(returnGames);
    }

    return gameList;
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
