'use strict';
const DIRECTIONS = require('./directions');
const DIRECTIONS_FORWARD = DIRECTIONS.FORWARD;
const DIRECTIONS_BACKWARD = DIRECTIONS.BACKWARD;
const DIRECTIONS_NOWHERE = DIRECTIONS.NOWHERE;
const DIRECTIONS_BOTH_WAYS = DIRECTIONS.BOTH_WAYS;

function getDirection(x, y, vertexes) {
    var arr = vertexes[x];
    var isNextSelected = false;
    var isPrevSelected = false;
    var isNext;
    var isPrev;

    if (arr) {
        isNext = arr[y + 1];
        isPrev = arr[y - 1];
    }
    if (isNext) {
        isNextSelected = isNext.isSelected;
    }

    if (isPrev) {
        isPrevSelected = isPrev.isSelected;
    }

    if (!isPrev && !isNext ||
        isPrevSelected && isNextSelected ||
        !isPrev && isNextSelected ||
        !isNext && isPrevSelected) {
        return DIRECTIONS_NOWHERE;
    } else if ((!isPrev || isPrev && isPrevSelected) && !isNextSelected && isNext) {
        return DIRECTIONS_FORWARD;
    } else if (isNextSelected) {
        return DIRECTIONS_BACKWARD;
    } else if (!isNextSelected && !isPrevSelected) {
        return DIRECTIONS_BOTH_WAYS;
    }
    return DIRECTIONS_FORWARD;
}

module.exports = {
    getDirection: getDirection
};
