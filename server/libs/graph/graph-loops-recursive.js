'use strict';

var commonUtils = require('./utils/common-utils');
var convertUtils = require('./utils/convert-utils');
var loopCheckerUtils = require('./utils/loop-checker-utils');
var vertexUtils = require('./utils/vertex-utils');
var defaultLoopChecker = [
    loopCheckerUtils.isCorrectNumbersOfVertexes,
    loopCheckerUtils.isStartAndFinishNeighbor
];

function getLoops(dataArray) {
    var borders = commonUtils.getMinMaxCorners(dataArray);
    var minX = borders.min.x;
    var minY = borders.min.y;
    var workData = convertUtils.convertInbound(
        borders.max.x - minX + 1,
        borders.max.y - minY + 1,
        minX,
        minY,
        dataArray);
    var extLoops = [];
    var path = [];
    var loops_ = [];
    var logs = [];
    dataArray.forEach(function (data) {
        var relX = data.x - minX;
        var relY = data.y - minY;
        var loops = [];
        if (workData[relX][relY] && !workData[relX][relY].isVisited) {
            findLoops({x: relX, y: relY}, path, loops, workData);
            clearInPath(workData);
            logs.push({
                step: data, arr: loops.map(function (loop) {
                    return loop.map(function (d) {
                        return {x: d.x + minX, y: d.y + minY};
                    });
                })
            });
        }
        loops_.push.apply(loops_, loops);
    });
    extLoops = loops_.map(function (loop) {
        return convertUtils.convertLoopToOutbound(loop, minX, minY);
    });
    extLoops = getCorrectLoops(loops_, defaultLoopChecker);
    return extLoops;
}

function findLoops(pos, path, loops, workData) {
    var neighbors;
    var isDeadlock = true; // must be 'true' for correct logic
    workData[pos.x][pos.y].isInPath = true;
    path.push(pos);
    neighbors = vertexUtils.getNeighbors(
        pos,
        workData,
        path[path.length - 2] ? [path[path.length - 2]] : null
    );
    if (neighbors.length) {
        neighbors.forEach(function (neighbor) {
            var workNeighbor = workData[neighbor.x][neighbor.y];
            if (workNeighbor.isInPath) {
                loops.push(extractLoop(path, neighbor));
            } else {
                workNeighbor.isVisited = true;
                if (findLoops(neighbor, path, loops, workData)) {
                    //               isDeadlock = isDeadlock && true;
                } else {
                    //             isDeadlock = false;
                    //path.push(pos);
                }
            }
        });
    } else {
        isDeadlock = true;
    }
    if (isDeadlock) {
        console.info('isDeadlock true: %s %s', pos.x, pos.y);
        workData[pos.x][pos.y].isDeadlock = true;
    } else {
        //path.push(pos);
    }
    path.pop();
    return isDeadlock;
}


function clearInPath(workData) {
    workData.forEach(function (row) {
        row.forEach(function (item) {
            if (item.isInPath) {
                item.isInPath = false;
            }
        });
    });
}

function extractLoop(path, startItem) {
    var loop = [];
    var index = path.length - 1;
    while (index > -1) {
        loop.push(path[index]);
        if (path[index].x === startItem.x && path[index].y === startItem.y) {
            break;
        }
        index--;
    }
    if (loop.length) {
        //loop.splice(0, 0, startItem);
    }
    return loop;
}

function getCorrectLoops(loops, checkers, vertexes) {
    var result = [];
    loops.forEach(function (loop) {
        var isValid = checkers.every(function (check) {
            return check(loop, vertexes);
        });
        if (isValid) {
            result.push(loop);
        }
    });
    return result;
}

function filterVertexesInsideLoop(vertexes, loop) {
    var result = [];
    vertexes.forEach(function (vertex) {
        if (loopCheckerUtils.isVertexInsideLoop(loop, vertex)) {
            result.push(vertex);
        }
    });
    return result;
}

module.exports = {
    getLoops: getLoops,
    filterVertexesInsideLoop: filterVertexesInsideLoop
};
