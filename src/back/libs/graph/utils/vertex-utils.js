'use strict';

function getNeighbors(pos, workData, excludes) {
    var result = [];
    var shifts = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]];
    shifts.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1) {
            if (workData[x]
                && workData[x][y]
                && !workData[x][y].isDeadlock
                && checkExclude(excludes, {x: x, y: y})) {
                result.push({x: x, y: y});
            }
        }
    });
    return result;
}

function getSelectedNeighborsFrom_4_Direction(pos, vertexes) {
    var result = [];
    var shifts = [
        [-1, 0],
        [0, -1], [0, 1],
        [1, 0]
    ];
    shifts.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1) {
            if (vertexes[x]
                && vertexes[x][y]
                && vertexes[x][y].isSelected) {
                result.push({x: x, y: y});
            }
        }
    });
    return result;
}

function getSelectedNeighborsFrom_8_Direction(pos, vertexes) {
    var result = [];
    var shifts = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    shifts.forEach(function (shift) {
        var x = pos.x + shift[0];
        var y = pos.y + shift[1];
        if (x > -1 && y > -1) {
            if (vertexes[x]
                && vertexes[x][y]
                && vertexes[x][y].isSelected) {
                result.push({x: x, y: y});
            }
        }
    });
    return result;
}

function applySelectedNeighborsFrom_8_Direction(pos, selected, vertexes) {
    var shifts = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    var index = shifts.length - 1;
    while (index >= 0) {
        let x = pos.x + shifts[index][0];
        let y = pos.y + shifts[index][1];
        if (x > -1 && y > -1) {
            if (vertexes[x]
                && vertexes[x][y]
                && vertexes[x][y].isSelected) {
                selected[x + '.' + y] = vertexes[x][y];
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


module.exports = {
    getNeighbors: getNeighbors,
    getSelectedNeighborsFrom_4_Direction: getSelectedNeighborsFrom_4_Direction,
    getSelectedNeighborsFrom_8_Direction: getSelectedNeighborsFrom_8_Direction,
    applySelectedNeighborsFrom_8_Direction: applySelectedNeighborsFrom_8_Direction
};
