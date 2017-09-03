'use strict';

const _ = require('lodash');

function sortFunction(o1, o2) {
    if (o1.x > o2.x || o1.x === o2.x && o1.y > o2.y) {
        return -1;
    } else if (o1.x < o2.x || o1.x === o2.x && o1.y < o2.y) {
        return 1;
    }
    return 0;
}

function isUnsortedArraysEqual(expect, actual) {
    function isEqualToExpect(actualItem, index) {
        return actualItem.x === preparedExpect[index].x && actualItem.y === preparedExpect[index].y;
    }
    const preparedActual = _.cloneDeep(actual);
    const preparedExpect = _.cloneDeep(expect);

    preparedActual.sort(sortFunction);
    preparedExpect.sort(sortFunction);
    console.info('Actual-----------------------')
    console.info(preparedActual)
    console.info('Expect******************')
    console.info(preparedExpect)

    return preparedActual.every(isEqualToExpect);
}

function isUnsortedListOfArraysEqual(expect, actual) {
    const preparedActual = _.cloneDeep(actual);
    const preparedExpect = _.cloneDeep(expect);
    let arraysAreEquals = true;
    _.forEachRight(preparedActual, (actualItem, actualIndex) => {
        let tryNext = false;
        _.forEachRight(preparedExpect, (expectItem, expectIndex) => {
            if (isUnsortedArraysEqual(expectItem, actualItem)) {
                preparedExpect.splice(expectIndex, 1);
                preparedActual.splice(actualIndex, 1);
                tryNext = true;
                return false;
            }
        });
        if (!tryNext) {
            arraysAreEquals = false;
            return false;
        }
    });
    return arraysAreEquals;
}

module.exports = {
    isUnsortedArraysEqual: isUnsortedArraysEqual,
    isUnsortedListOfArraysEqual: isUnsortedListOfArraysEqual
};
