define([
    'lodash'
], function (_) {
    'use strict';

    function toEqualArray(comparator) {
        var hasComparator = _.isFunction(comparator);
        return function toEqualArrayComparator() {
            return {
                compare: function compareArrays(actual, expected) {
                    var passed = {
                            actual: [],
                            expected: []
                        },
                        result = {
                            pass: _.isArray(actual) && _.isArray(expected) && actual.length === expected.length
                        };

                    if (result.pass && actual.length !== 0) {
                        result.pass = _.every(expected, function iterateExpected(expectedItem, expectedIndex) {
                            passed.expected.push(expectedIndex);
                            return _.some(actual, function iterateActual(actualItem, actualIndex) {
                                if (passed.actual.indexOf(actualIndex) < 0 &&
                                    (hasComparator && comparator(expectedItem, actualItem) ||
                                    _.isEqual(expectedItem, actualItem))) {
                                    passed.actual.push(actualIndex);
                                    return true;
                                }
                                return false;
                            });
                        });
                    }

                    result.message = result.pass ? true : 'Actual and expected arrays are not equal: ' +
                    '\n Actual: ' + JSON.stringify(actual) +
                    '\n Expected: ' + JSON.stringify(expected);

                    return result;
                }
            };
        };
    }


    function toEqualPath() {
        return toEqualArray(function (expectedItem, actualItem) {
            return _.isEqual(expectedItem.start, actualItem.start) &&
                _.isEqual(expectedItem.finish, actualItem.finish) ||
                _.isEqual(expectedItem.start, actualItem.finish) &&
                _.isEqual(expectedItem.finish, actualItem.start);
        });
    }

    function init() {
        jasmine.addMatchers({
            toEqualArray: toEqualArray(),
            toEqualPath: toEqualPath()
        });
    }

    return {
        init: init
    };
});

