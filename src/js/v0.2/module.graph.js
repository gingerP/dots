define([], function () {
    'use strict';

    var api;
    var moduleGameBusiness;
    var cache;
    const DATA_UID_PREFIX = 'graph_id';

    function getLoops(gameData, selfData, enemyData) {
        var passedWay = [];
        var loops = [];
        getLoops_(gameData, selfData[0], passedWay, selfData, loops, enemyData);
        return loops;
    }

    function getTrappedDots(loopData, enemyGameData) {
        var result = [];
        if (enemyGameData.length) {
            enemyGameData.forEach(function (enemy) {
                var inter = getIntersectionNumWithLoopByX_(enemy, loopData);
                if (inter.left && inter.right
                    && Math.floor(inter.left / 2) !== inter.left / 2
                    && Math.floor(inter.right / 2) !== inter.right / 2) {
                    result.push(enemy);
                }
            });
        }
        return result;
    }

    function getIntersectionNumWithLoopByX_(vertexData, loopData) {
        var leftInter = 0;
        var rightInter = 0;
        if (loopData.length) {
            loopData.forEach(function (loopVertex) {
                if (loopVertex.yInd === vertexData.yInd) {
                    if (loopVertex.xInd > vertexData.xInd) {
                        rightInter++;
                    } else if (loopVertex.xInd < vertexData.xInd) {
                        leftInter++;
                    }
                }
            });
        }
        return {
            left: leftInter,
            right: rightInter
        }
    }

    function getLoops_(gameData, vertexData, passedWay, selfData, loops, enemyData) {
        var prevVertexData = passedWay[passedWay.length - 1];
        var neighbors = getNeighbors_(gameData, vertexData, prevVertexData, selfData);
        logVertexData(vertexData, neighbors);
        if (neighbors.length) {
            passedWay.push(vertexData);
            neighbors.forEach(function (neighbor) {
                var loop;
                if (isExistInArray(neighbor, passedWay)) {
                    loop = getPath_(neighbor, passedWay);
                    if (getTrappedDots(loop, enemyData).length) {
                        loop.push(neighbor);
                        logLoopData(loop);
                        loops.push(loop);
                    }
                } else {
                    getLoops_(gameData, neighbor, passedWay, selfData, loops, enemyData);
                }
            });
        }
        return !!neighbors.length;
    }


    function getNeighbors_(gameData, vertexData, prevVertexData, selfData) {
        var result = [];
        var shifts = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]];
        var pos = {
            x: vertexData.xInd,
            y: vertexData.yInd
        };
        shifts.forEach(function (shift) {
            var x = pos.x + shift[0];
            var y = pos.y + shift[1];
            if (x > -1 && y > -1) {
                var data = gameData[x][y];
                if (data.id !== vertexData.id && isExistInArray(data, selfData)
                    && (prevVertexData && data.id !== prevVertexData.id || !prevVertexData)) {
                    result.push(data);
                }
            }
        });
        return result;
    }

    function convertToGraph_(gameData) {
        if (!cache) {
            gameData.forEach(function (data) {

            });
        }
        return cache;
    }

    function getDataUId_(data) {
        return DATA_UID_PREFIX + '_' + data.id;
    }

    function getPath_(lastVertex, path) {
        var result = [];
        var index = path.length - 1;
        while (index > -1) {
            result.push(path[index]);
            if (path[index].id === lastVertex.id) {
                break;
            }
            index--;
        }
        return result.reverse();
    }

    /*    function getTrappedDots(loop, gameData) {
     var max = 0;
     var min = 0;
     var partitionOnY = {};
     var partitionOnYKey;
     loop.forEach(function(data, index) {
     max = data.yInd > max? data.yInd: max;
     min = data.yInd < min? data.yInd: min;
     partitionOnY[data.yInd] = partitionOnY[data.yInd] || [];
     partitionOnY[data.yInd].push([loop[index - 1], data, loop[index + 1]]);
     });

     for(partitionOnYKey in partitionOnY) {
     partitionOnY[partitionOnYKey].sort(function(data1, data2) {
     return data1[1].xInd - data2[1].xInd;
     });
     getTrappedDotsIterator_(partitionOnY[partitionOnYKey]);
     }

     }

     function getTrappedDotsIterator_(borders) {
     var result = [];
     var isInner = false;
     borders.forEach(function(item, index) {
     /!**
     *   \
     *    *
     *     \
     *!/
     if (item[0].yInd > item[1].yInd && item[2].yInd < item[1].yInd
     /!**
     *     /
     *    *
     *   /
     *!/
     || item[0].yInd < item[1].yInd && item[2].yInd > item[1].yInd) {
     isInner = !isInner;
     if (isInner) {

     }
     }
     });
     return result;
     }*/

    /*    function getBordersSub(array, startElement, endElement) {
     var result = [];
     var isBegining = false;
     array.some(function(element) {
     if (element[1] === startElement) {
     isBegining =
     }
     return
     });

     return result;
     }*/

    function logVertexData(vertex, path) {
        console.log('%c vertex: %s ; path: ', 'color: ' + moduleGameBusiness.getActivePlayerColor(), [vertex.xInd, vertex.yInd].join(','), path.map(function (vertex) {
            return vertex.xInd + ',' + vertex.yInd;
        }).join('; '));
    }

    function logLoopData(loop) {
        console.log('%c loop: %s ', 'color: ' + moduleGameBusiness.getActivePlayerColor(), loop.map(function (vertex) {
            return vertex.xInd + ',' + vertex.yInd;
        }).join('; '));
    }

    function isExistInArray(search, array) {
        return array.some(function (item) {
            return item.id === search.id;
        });
    }

    function getLoopsV2(dataArray, checkers) {
        var borders = getBorders_(dataArray);
        var minX = borders.min.x;
        var minY = borders.min.y;
        var workData = createWorkData_(
            borders.max.x - minX  + 1,
            borders.max.y - minY  + 1,
            minX,
            minY,
            dataArray);
        var loops = [];
        var extLoops = [];
        var path = [];
        dataArray.forEach(function(data) {
            var relX = data.x - minX;
            var relY = data.y - minY;
            if (workData[relX][relY] && !workData[relX][relY].isVisited) {
                findLoops({x: relX, y: relY}, path, loops, workData);
            }
        });
        extLoops = loops.map(function(loop) {
            return convertLoopToExtData(loop, minX, minY);
        });
        if (checkers && checkers.length) {
            extLoops = getCorrectLoops_(loops, checkers);
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
            path[path.length - 2]? [path[path.length - 2]]: undefined
        );
        if (neighbors.length) {
            neighbors.forEach(function(neighbor) {
                var workNeighbor = workData[neighbor.x][neighbor.y];
                if (workNeighbor.isInPath) {
                    loops.push(extractLoop_(path, neighbor));
                } else {
                    workNeighbor.isVisited = true;
                    isDeadlock = isDeadlock && findLoops(neighbor, path, loops, workData);
                }
            });
        } else {
            isDeadlock = true;
        }
        if (isDeadlock) {
            workData[pos.x][pos.y].isDeadlock = true;
            path.pop();
        }
        return isDeadlock;
    }

    function convertLoopToExtData(loop, xShift, yShift) {
        return loop.map(function(loopItem) {
           return {
               x: loopItem.x + xShift,
               y: loopItem.y + yShift
           }
        });
    }

    function extractLoop_(path, startItem) {
        var loop = [];
        var index = path.length - 1;
        while(index > -1) {
            loop.push(path[index]);
            if (path[index].x === startItem.x && path[index].y === startItem.y) {
                break
            }
            index--;
        }
        if (loop.length) {
            loop.splice(0, 0, startItem);
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
            result = !excludes.some(function(excl) {
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

    function getCorrectLoops_(loops, checkers) {
        var result = [];
        loops.forEach(function(loop) {
            var isValid = checkers.every(function(check) {
                return check(loop);
            });
            if (isValid) {
                result.push(loop);
            }
        });
        return result;
    }

    function isCorrectNumbersOfVertexes(loop, vertexes) {
        return loop.length > 3;
    }

    function isLoopSurroundsVertexes(loop, vertexes) {
        if (vertexes) {
            return getVertexesInsideLoop(loop, vertexes).length;
        }
        return false;
    }

    function getVertexesInsideLoop(loop, vertexes) {
        var borders;
        var vertexesInsideBorders;
        if (vertexes && vertexes.length) {
            borders = getBorders_(loop);
            vertexesInsideBorders = filterVertexesByBorders_(vertexes, borders.min, borders.max);


        }
    }

    function filterVertexesByBorders_(vertexes, topLeft, bottomRight) {
        var result = [];
        vertexes.forEach(function(vertex) {
            if (vertex.x >= topLeft.x && vertex.x <= bottomRight.x
                && vertex.y >= topLeft.y && vertex.y <= bottomRight.y) {
                result.push(vertex);
            }
        });
        return result;
    }


    api = {
        getLoops: getLoopsV2,
        getTrappedDots: getTrappedDots,
        getVertexesInsideLoop: getVertexesInsideLoop,
        getCorrectLoops: function(loops, checkers, vertexes) {
            return getCorrectLoops_(loops, checkers, vertexes);
        },
        checkers: {
            isCorrectNumbersOfVertexes: isCorrectNumbersOfVertexes,
            isLoopSurroundsVertexes: isLoopSurroundsVertexes
        },
        sb: function (module) {
            moduleGameBusiness = module;
        }
    };
    return api;
});