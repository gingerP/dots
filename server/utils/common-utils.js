var _ = require('lodash');

function isClientIdEmpty(clientId) {
    return !clientId;
}

function getRandomString() {
    return Math.random().toString(36).substring(7);
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createArray(array) {
    var prepareArray = [];
    if (array) {
        prepareArray = _.isArray(array) ? array : [array];
    }
    return prepareArray;
}

module.exports = {
    isClientIdEmpty: isClientIdEmpty,
    getRandomString: getRandomString,
    getRandomArbitrary: getRandomArbitrary,
    createArray: createArray
};
