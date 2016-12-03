var _ = require('lodash');

module.exports = {
    getRandomString: function getRandomString() {
        return Math.random().toString(36).substring(7);
    },
    getRandomArbitrary: function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    createArray: function createArray(array) {
        var prepareArray = [];
        if (array) {
            prepareArray = _.isArray(array) ? array : [array];
        }
        return prepareArray;
    }
};
