if (typeof(define) != 'function') {
    function define(deps, module) {
        module.exports = module();
    }
}

define([], function () {
    'use strict';

    var api;
    var moduleGameBusiness;
    var cache;
    var DATA_UID_PREFIX = 'graph_id';

    function getLoopsV2(dataArray, checkers) {
        var borders = getBorders_(dataArray);
        var minX = borders.min.x;
        var minY = borders.min.y;
        var workData = createWorkData_(
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
                        })
                    })
                });
            }
            loops_.push.apply(loops_, loops);
        });
        extLoops = loops_.map(function (loop) {
            return convertLoopToExtData(loop, minX, minY);
        });
        if (checkers && checkers.length) {
            extLoops = getCorrectLoops_(loops_, checkers);
        }
        return extLoops;
    }

    function findLoops(pos, path, loops, workData) {
        var neighbors;
        var isDeadlock = true; // must be 'true' for correct logic
        workData[pos.x][pos.y].isInPath = true;
        path.push(pos);
        neighbors = getNeighborsV2_(
            pos,
            workData,
            path[path.length - 2] ? [path[path.length - 2]] : undefined
        );
        if (neighbors.length) {
            neighbors.forEach(function (neighbor) {
                var workNeighbor = workData[neighbor.x][neighbor.y];
                if (workNeighbor.isInPath) {
                    loops.push(extractLoop_(path, neighbor));
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

    function convertLoopToExtData(loop, xShift, yShift) {
        return loop.map(function (loopItem) {
            return {
                x: loopItem.x + xShift,
                y: loopItem.y + yShift
            }
        });
    }

    function clearInPath(workData) {
        workData.forEach(function (row) {
            row.forEach(function (item) {
                if (item.isInPath) {
                    item.isInPath = false;
                }
            })
        })
    }

    function extractLoop_(path, startItem) {
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

    function getRelPos_(data, borders) {
        return {
            x: data.x - (borders.max.x - borders.min.x),
            y: data.y - (borders.max.y - borders.min.y)
        };
    }

    function getNeighborsV2_(pos, workData, excludes) {
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
                    && checkExclude_(excludes, {x: x, y: y})) {
                    result.push({x: x, y: y});
                }
            }
        });
        return result;
    }

    function checkExclude_(excludes, data) {
        var result = true;
        if (excludes && excludes.length) {
            result = !excludes.some(function (excl) {
                return excl.x === data.x && excl.y === data.y;
            });
        }
        return result;
    }

    function createWorkData_(sizeX, sizeY, minX, minY, sourceData) {
        var workData = [];
        var xInd = 0;
        for (; xInd < sizeX; xInd++) {
            workData.push([]);
        }
        sourceData.forEach(function (data) {
            workData[data.x - minX][data.y - minY] = getEmptyWorkDataBlock();
        });
        return workData;
    }

    function getEmptyWorkDataBlock(extendData) {
        return {
            isVisited: false,
            isDeadlock: false,
            isInPath: false,
            extendData: extendData || {}
        }
    }

    function getBorders_(dataArray) {
        var minX = dataArray[0].x;
        var minY = dataArray[0].y;
        var maxX = dataArray[0].x;
        var maxY = dataArray[0].y;
        dataArray.forEach(function (data) {
            maxX = data.x > maxX ? data.x : maxX;
            maxY = data.y > maxY ? data.y : maxY;
            minX = data.x < minX ? data.x : minX;
            minY = data.y < minY ? data.y : minY;
        });
        return {
            min: {
                x: minX,
                y: minY
            },
            max: {
                x: maxX,
                y: maxY
            }
        };
    }

    function getCorrectLoops_(loops, checkers, vertexes) {
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

    function isVertexInsideLoop_(loop, vertex) {
        var left = 0;
        var right = 0;
        var pack;

        function add(item) {
            if (item.x > vertex.x) {
                right++;
            } else if (item.x < vertex.x) {
                left++
            }
        }

        loop.forEach(function (current, index) {
            var next;
            var prev;
            var isIncrease = false;
            if (current.y === vertex.y) {
                pack = {};
                next = loop[index + 1] ? loop[index + 1] : loop[0];
                prev = loop[index - 1] ? loop[index - 1] : loop[loop.length - 1];
                if (prev.y < current.y && next.y > current.y
                    || prev.y > current.y && next.y < current.y) {
                    add(current);
                } else if (prev.y < current.y && next.y < current.y
                    || prev.y > current.y && next.y > current.y) {
                    //tangent
                } else if ((prev.y < current.y || prev.y > current.y) && next.y === vertex.y) {
                    isIncrease = prev.y < current.y;
                } else if ((next.y < current.y || next.y > current.y) && prev.y === vertex.y) {
                    if (isIncrease && next.y > current.y || !isIncrease && next.y > current.y) {
                        add(current);
                    }
                }
            }
        });
        return left && right && Math.floor(right / 2) !== right / 2 && Math.floor(left / 2) !== left / 2;
    }

    function filterVertexesInsideLoop(vertexes, loop) {
        var result = [];
        vertexes.forEach(function (vertex) {
            if (isVertexInsideLoop_(loop, vertex)) {
                result.push(vertex);
            }
        });
        return result;
    }

    // Checkers

    function isCorrectNumbersOfVertexes(loop, vertexes) {
        return loop.length > 3;
    }

    function isLoopSurroundsVertexes(loop, vertexes) {
        if (vertexes) {
            return vertexes.some(function (vertex) {
                return isVertexInsideLoop_(loop, vertex);
            });
        }
        return false;
    }

    function isStartAndFinishNeighbor(loop) {
        return loop.length > 3 && loop.every(function (item, index) {
                var next = loop[index + 1] || loop[0];
                return Math.abs(item.x - next.x) <= 1 &&
                    Math.abs(item.y - next.y) <= 1;
            });
    }

    api = {
        getLoops: getLoopsV2,
        filterVertexesInsideLoop: filterVertexesInsideLoop,
        getCorrectLoops: function (loops, checkers, vertexes) {
            return getCorrectLoops_(loops, checkers, vertexes);
        },
        checkers: {
            isCorrectNumbersOfVertexes: isCorrectNumbersOfVertexes,
            isLoopSurroundsVertexes: isLoopSurroundsVertexes,
            isStartAndFinishNeighbor: isStartAndFinishNeighbor
        },
        sb: function (module) {
            moduleGameBusiness = module;
        }
    };
    return api;
});