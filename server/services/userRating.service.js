'use strict';

const IOC = require('server/constants/ioc.constants');
const Promise = require('bluebird');

class UserRatingService {

    async updateRatings(game, initiator, respondent, action) {
        const [initiatorData, respondentData] = await Promise.all([
            this.gameDataDb.getGameData(game._id, initiator._id),
            this.gameDataDb.getGameData(game._id, respondent._id),
        ]);
        const [initiatorCache, respondentCache] = await this.gameCacheDb.getCacheByGameDataId(initiatorData._id, respondentData._id);


    }

    postConstructor(ioc) {
        this.gameDataDb = ioc[IOC.DB_MANAGER.GAME_DATA];
        this.gameCacheDb = ioc[IOC.DB_MANAGER.GAME_DATA_CACHE];
        this.usersDb = ioc[IOC.DB_MANAGER.CLIENTS];
    }

    getName () {
        return IOC.SERVICE.USER_RATING;
    }
}

module.exports = UserRatingService;