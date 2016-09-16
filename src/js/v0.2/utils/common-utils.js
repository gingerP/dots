define([], function() {
    'use strict';

    var api;

    api = {
        getRandomString: function getRandomString() {
            return Math.random().toString(36).substring(7);
        }
    };

    return api;
});