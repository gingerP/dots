'use strict';
const DIRECTIONS = require('./directions');

function getDirection(x, y, vertexes) {
    var arr = vertexes[x];
    var isNext = arr ? arr[y + 1] : null;
    var isPrev = arr ? arr[y - 1] : null;
    var isNextSelected = isNext ? isNext.isSelected : false;
    var isPrevSelected = isPrev ? isPrev.isSelected : false;

    if (!isPrev && !isNext ||
        isPrevSelected && isNextSelected ||
        !isPrev && isNextSelected ||
        !isNext && isPrevSelected) {

        return DIRECTIONS.NOWHERE;
    } else if (isPrevSelected) {
        return DIRECTIONS.FORWARD;
    } else if (isNextSelected) {
        return DIRECTIONS.BACKWARD;
    } else if (!isNextSelected && !isPrevSelected) {
        return DIRECTIONS.BOTH_WAYS;
    }
    return DIRECTIONS.FORWARD;
}

module.exports = {
    getDirection: getDirection
};
