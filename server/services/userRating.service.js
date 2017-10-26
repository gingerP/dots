'use strict';

const IOC = require('server/constants/ioc.constants');
const Promise = require('bluebird');

class UserRatingService {

    async calculateRatings(game, initiator, respondent, action) {
        const [initiatorData, respondentData] = await Promise.all([
            this.gameDataDb.getGameData(game._id, initiator._id),
            this.gameDataDb.getGameData(game._id, respondent._id),
        ]);
        const [initiatorCache, respondentCache] = await this.gameCacheDb.getCacheByGameDataId(initiatorData._id, respondentData._id);
        const initCaptured = this.calculateCapturedDots(initiatorCache);
        const respCaptured = this.calculateCapturedDots(respondentCache);
        const isEqual = initCaptured === respCaptured;
        const isInit = initCaptured > respCaptured;
        return {
            initiator: isEqual ? 0 : (isInit ? initCaptured : -1 * initCaptured),
            respondent: isEqual ? 0 : (isInit ? -1 * respCaptured : respCaptured)
        };
    }

    /**
     *
     * @param {GameDataCache} gameCache
     * @returns {number}
     */
    calculateCapturedDots(gameCache) {
        let number = 0;
        for (let loop in gameCache.cache) {
            number += loop.loop.length;
        }
        return number;
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