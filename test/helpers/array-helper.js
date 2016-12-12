define([], function() {
    'use strict';

    jasmine.addMatchers({
        toEqualDeeply: function (util, customEqualityTesters) {
            return {
                compare: (actual),
                pass: util.equals(actual, [1, 2, 3], customEqualityTesters)
            };
        }
    });
});

