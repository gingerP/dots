'use strict';

const _ = require('lodash');
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
const DIRECTION_8_SHIFTS_TRUE_DIRECTION = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

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

/**
 *
 * @param vertex, e.g. {x: 1, y: 1}
 * @param vertexes, e.g. [{x: 1, y: 1}, {x: 2, y: 2}, ...]
 */
function getHolesFromNeighbors(vertex, vertexes) {
    let index = DIRECTION_8_SHIFTS.length - 1;
    let neighbor;
    const holes = [];
    while (index >= 0) {
        neighbor = {x: vertex.x + DIRECTION_8_SHIFTS[index].x, y: vertex.y + DIRECTION_8_SHIFTS[index].y};
        if (!_.has(vertexes, neighbor)) {
            holes.push(neighbor);
        }
        index--;
    }
    return holes;
}

/**
 *
 * @param vertex, e.g. {x: 1, y: 1}
 * @param vertexes, [{x: 1, y: 1}, {x: 2, y: 2}, {x: 4, y: 5}, ...]
 * @returns e.g. [[{x: 1, y: 1}, {x: 2, y: 2}], [{x: 4, y: 5}], ...]
 */
function getHolesFromNeighborsAsGroups(vertex, vertexes) {
    let index = 0;
    let neighbor;
    const holesGroups = [];
    let group = [];
    while (index < DIRECTION_8_SHIFTS_TRUE_DIRECTION.length) {
        neighbor = {
            x: vertex.x + DIRECTION_8_SHIFTS_TRUE_DIRECTION[index][0],
            y: vertex.y + DIRECTION_8_SHIFTS_TRUE_DIRECTION[index][1]
        };
        if (_.findIndex(vertexes, neighbor) === -1) {
            group = group || [];
            group.push(neighbor);
            if (index === DIRECTION_8_SHIFTS_TRUE_DIRECTION.length - 1 && isHolesGroupValid(group, vertex)) {
                holesGroups.push(group);
            }
        } else {
            if (group.length && isHolesGroupValid(group, vertex)) {
                holesGroups.push(group);
            }
            group = [];
        }
        index++;
    }
    return holesGroups;
}

function isHolesGroupValid(group, vertex) {
    if (group.length === 1) {
        const sum = Math.abs(group[0].x - vertex.x) + Math.abs(group[0].y - vertex.y);
        return sum !== 2;
    }
    return true;
}

module.exports = {
    getNeighbors: getNeighbors,
    getSelectedNeighborsFrom_4_Direction: getSelectedNeighborsFrom_4_Direction,
    getSelectedNeighborsFrom_8_Direction: getSelectedNeighborsFrom_8_Direction,
    applySelectedNeighborsFrom_2_Direction: applySelectedNeighborsFrom_2_Direction,
    applySelectedNeighborsFrom_8_Direction: applySelectedNeighborsFrom_8_Direction,
    hasSpill: hasSpill,
    getHolesFromNeighbors: getHolesFromNeighbors,
    getHolesFromNeighborsAsGroups: getHolesFromNeighborsAsGroups
};
