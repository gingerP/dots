define([], function() {
	'use strict';

	var api;
	var cache;
    const DATA_UID_PREFIX = 'graph_id';

	function getLoops(gameData, selfData, enemyData) {
        var passedWay = [];
        var loops = [];
        getLoops_(gameData, selfData[0], passedWay, selfData, loops, enemyData);
	}

	function getTrappedDots(loopData, enemyGameData) {
        var result = [];
        if (enemyGameData.length) {
            enemyGameData.forEach(function(enemy) {
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
            loopData.forEach(function(loopVertex) {
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
        passedWay.push(vertexData);
		if (neighbors.length) {
            neighbors.forEach(function(neighbor) {
                var loop;
                if (isExistInArray(neighbor, passedWay)) {
                    loop = getPath_(neighbor, passedWay);
                    if (getTrappedDots(loop, enemyData).length) {
                        loops.push(loop);
                    }
                } else {
                    getLoops_(gameData, neighbor, passedWay, selfData, loops, enemyData);
                }
            });
        }
	}


	function getNeighbors_(gameData, vertexData, prevVertexData, selfData) {
		var result = [];
		var shifts = [
			[-1, -1], 	[0, -1], 	[1, -1],
			[-1, 0], 				[1, 0],
			[-1, 1], 	[0, 1], 	[1, 1]];
        var pos = {
            x: vertexData.xInd,
            y: vertexData.yInd
        };
        shifts.forEach(function(shift) {
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
            gameData.forEach(function(data) {

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
        while(index > -1) {
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

    function isExistInArray(search, array) {
        return array.some(function(item) {
            return item.id === search.id;
        });
    }

	api = {
		getLoops: getLoops,
		getTrappedDots: getTrappedDots
	};
	return api;
});