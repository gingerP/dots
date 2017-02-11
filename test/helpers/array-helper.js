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
                            pass: _.isArray(actual) && _.isArray(expected) && actual.length === expected.length,
                            message: ''
                        },
                        wrongItem = {};

                    function iterateExpected(expectedItem, expectedIndex) {
                        var result;

                        passed.expected.push(expectedIndex);
                        result = _.some(actual, isActualEqualTo.bind(null, expectedItem));
                        if (!result) {
                            wrongItem = expectedItem;
                        }
                        return result;
                    }

                    function isActualEqualTo(expectedItem, actualItem, actualIndex) {
                        if (passed.actual.indexOf(actualIndex) < 0 &&
                            (hasComparator && comparator(expectedItem, actualItem) ||
                            _.isEqual(expectedItem, actualItem))) {
                            passed.actual.push(actualIndex);
                            return true;
                        }
                        return false;
                    }

                    if (!result.pass) {
                        result.message = result.pass ? true : 'Actual and expected arrays are not equal by size!';
                    } else if (result.pass && actual.length !== 0) {
                        result.pass = _.every(expected, iterateExpected);
                        result.message = result.pass ? true : 'Actual and expected arrays are not equal. ' +
                            'Wrong item: ' + JSON.stringify(wrongItem);
                    }
                    result.message += result.pass ? true : '\n Actual: ' + JSON.stringify(actual) + '\n Expected: ' + JSON.stringify(expected);

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

