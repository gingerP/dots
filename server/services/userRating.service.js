'use strict';

const IOC = require('server/constants/ioc.constants');

class UserRatingService {

    updateRatings(user, opponent, game) {

    }

    postConstructor() {

    }

    getName () {
        return IOC.SERVICE.USER_RATING;
    }
}

module.exports = UserRatingService;