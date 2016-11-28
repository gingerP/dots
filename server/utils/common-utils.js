var _ = require('lodash');

module.exports = {
    getRandomString: function getRandomString() {
        return Math.random().toString(36).substring(7);
    },
    createArray: function createArray(array) {
        var prepareArray = [];
        if (array) {
            prepareArray = _.isArray(array) ? array : [array];
        }
        return prepareArray;
    }
};
