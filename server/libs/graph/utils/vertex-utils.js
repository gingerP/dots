'use strict';

const CreatingUtils = require('./creation-utils');
const DIRECTION_2_SHIFTS = [[-1, 0], [1, 0]];
const DIRECTION_4_SHIFTS = [
    [-1, 0],
    [0, -1], [0, 1],
    [1, 0]
];
const DIRECTION_8_SHIFTS = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
];

function getNeighbors(pos, workData, excludes) {
    var result = [];
    DIRECTION_8_SHIFTS.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1 && workData[x]
            && workData[x][y]
            && !workData[x][y].isDeadlock
            && checkExclude(excludes, CreatingUtils.newVertex(x, y))) {
            result.push(CreatingUtils.newVertex(x, y));

        }
    });
    return result;
}

function getSelectedNeighborsFrom_4_Direction(pos, vertexes) {
    var result = [];
    DIRECTION_4_SHIFTS.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1) {
            if (vertexes[x]
                && vertexes[x][y]
                && vertexes[x][y].isSelected) {
                result.push(CreatingUtils.newVertex(x, y));
            }
        }
    });
    return result;
}

function getSelectedNeighborsFrom_8_Direction(pos, vertexes) {
    var result = [];
    DIRECTION_8_SHIFTS.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1) {
            if (vertexes[x]
                && vertexes[x][y]
                && vertexes[x][y].isSelected) {
                result.push(CreatingUtils.newVertex(x, y));
            }
        }
    });
    return result;
}

function applySelectedNeighborsFrom_8_Direction(pos, selected, vertexes) {
    var index = DIRECTION_4_SHIFTS.length - 1,
        x,
        y,
        key,
        vertex;
    while (index > -1) {
        x = pos.x + DIRECTION_4_SHIFTS[index][0];
        y = pos.y + DIRECTION_4_SHIFTS[index][1];
        if (x > -1 && y > -1 && vertexes[x] && vertexes[x][y]) {
            vertex = vertexes[x][y];

            key = x + '.' + y;
            if (!selected.hasOwnProperty(key) && vertex.isSelected) {
                selected[key] = vertex;
                vertex.pos = CreatingUtils.newVertex(x, y);
            }
        }
        index--;
    }
}

function applySelectedNeighborsFrom_2_Direction(pos, selected, vertexes) {
    var index = DIRECTION_2_SHIFTS.length - 1,
        x,
        y,
        key,
        vertex;
    while (index > -1) {
        x = pos.x + DIRECTION_2_SHIFTS[index][0];
        y = pos.y + DIRECTION_2_SHIFTS[index][1];
        if (x > -1 && y > -1 && vertexes[x] && vertexes[x][y]) {
            vertex = vertexes[x][y];

            key = x + '.' + y;
            if (!selected.hasOwnProperty(key) && vertex.isSelected) {
                selected[key] = vertex;
                vertex.pos = CreatingUtils.newVertex(x, y);
            }
        }
        index--;
    }
}

function checkExclude(excludes, data) {
    var result = true;
    if (excludes && excludes.length) {
        result = !excludes.some(function (excl) {
            return excl.x === data.x && excl.y === data.y;
        });
    }
    return result;
}

function hasSpill(pos, vertexes) {
    var result = false;
    var index = DIRECTION_4_SHIFTS.length - 1;
    var shift;
    var vertex;
    while (index > -1) {
        shift = DIRECTION_4_SHIFTS[index];
        vertex = vertexes[pos.x + shift[0]];
        if (!vertex || !vertex[pos.y + shift[1]]) {
            return true;
        }
        index--;
    }
    return result;
}

module.exports = {
    getNeighbors: getNeighbors,
    getSelectedNeighborsFrom_4_Direction: getSelectedNeighborsFrom_4_Direction,
    getSelectedNeighborsFrom_8_Direction: getSelectedNeighborsFrom_8_Direction,
    applySelectedNeighborsFrom_2_Direction: applySelectedNeighborsFrom_2_Direction,
    applySelectedNeighborsFrom_8_Direction: applySelectedNeighborsFrom_8_Direction,
    hasSpill: hasSpill
};
