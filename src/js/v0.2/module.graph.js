define([], function() {
	'use strict';

	var api;
	var cache;

	function getLoops(data, markedVertexes) {

	}

	function getTrappedDots(enemyGameData, loopData) {
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

    function getIntersectionNumWithLoopByX_(data, loopData) {
        var leftInter = 0;
        var rightInter = 0;
        if (loopData.length) {
            loopData.forEach(function(loopVertex) {
                if (loopVertex.yInd === data.yInd) {
                    if (loopVertex.xInd > data.xInd) {
                        rightInter++;
                    } else if (loopVertex.xInd < data.xInd) {
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

	function getLoops_(gameData, vertexData, prevVertexData, markedVertexes) {
        var neighbors = getNeighbors(gameData, vertexData, prevVertexData, markedVertexes);
		if (neighbors.length) {
            neighbors.forEach()
        }
	}


	function getNeighbors_(gameData, vertexData, prevVertexData, markedVertexes) {
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
            var data = gameData[pos.x + shift[0]][pos.y + shift[1]];
            if (data.id !== vertexData.id && data.id !== prevVertexData.id && markedVertexes.indexOf(data.id) > -1) {
                result.push(data);
            }
        });
		return result;
	}

	function convertToGraph_(data, markedVertexes) {

	}

	api = {
		getLoops: getLoops,
		getTrappedDots: getTrappedDots
	};
	return api;
});