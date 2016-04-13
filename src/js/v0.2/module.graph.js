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

    function getLoopsV2(dataArray) {
        var borders = getBorders_(dataArray);
        var workData = createWorkData_(borders.max.x - borders.min.x, borders.max.y - borders.min.y, dataArray);
        var loops = [];
        var path = [];
        dataArray.forEach(function(data) {
            if (workData[data.x][data.y] && !workData[data.x][data.y].isVisited) {
                findLoops(getRelPos_(data, borders), path, loops, workData);
            }
        });
    }

    function findLoops(pos, path, loops, workData) {
        var neighbors = getNeighborsV2_(workData, pos);
        if (neighbors.length) {
            neighbors.forEach(function(neighbor) {
                if (workData[neighbor.x][neighbor.y].isVisited) {

                }
            });
        }
    }

    function getRelPos_(data, borders) {
        return {
            x: data.x - (borders.max.x - borders.min.x),
            y: data.y - (borders.max.y - borders.min.y)
        };
    }

    function getNeighborsV2_(pos, workData) {
        var result = [];
        var shifts = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]];
        shifts.forEach(function (shift) {
            var x = pos.x + shift[0];
            var y = pos.y + shift[1];
            if (x > -1 && y > -1) {
                if (workData[x][y] && !workData[x][y].isInPath && !workData[x][y].isDeadlock) {
                    result.push({x: x, y: y});
                }
            }
        });
        return result;
    }

    function createWorkData_(sizeX, sizeY, sourceData) {
        var workData = [];
        var xInd = 0;
        for (; xInd < sizeX; xInd++) {
            workData.push([]);
        }
        sourceData.forEach(function (data) {
            workData[data.x][data.y] = getEmptyWorkDataBlock();
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
        var minX;
        var minY;
        var maxX;
        var maxY;
        dataArray.forEach(function (data) {
            maxX = data.x > maxX ? data.x : maxX;
            maxY = data.y > maxY ? data.y : maxY;
            minX = data.x < minX ? data.x : minX;
            minY = data.y < minY ? data.y : minY;
        });
        return {
            mix: {
                x: minX,
                y: minY
            },
            max: {
                x: maxX,
                y: maxY
            }
        };
    }

    api = {
        getLoops: getLoopsV2,
        getTrappedDots: getTrappedDots,
        sb: function (module) {
            moduleGameBusiness = module;
        }
    };
    return api;
});