'use strict';

var _ = require('lodash');

function getMinMaxCorners(dataArray) {
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
        },
        size: (maxX - minX) * (maxY - minY)
    };
}

function findFirstUnselectedUnvisitedPosition(array, beginFromX, beginFromY) {
    var xIndex = beginFromX || 0;
    var yIndex = beginFromY || 0;
    for (; xIndex < array.length; xIndex++) {
        for (; yIndex < array[xIndex].length; yIndex++) {
            let vertex = array[xIndex][yIndex];
            if (!vertex.isSelected && !vertex.isVisited) {
                return {
                    x: xIndex,
                    y: yIndex
                };
            }
        }
        yIndex = 0;
    }
    return null;
}

function getUnselectedUnvisitedVertexesCount(vertexes) {
    var x = 0;
    var y;
    var result = 0;
    while (x < vertexes.length) {
        y = 0;
        while (y < vertexes[x].length) {
            let vertex = vertexes[x][y];
            if (!vertex.isSelected && !vertex.isVisited) {
                result = result + 1;
            }
            y++;
        }
        x++;
    }
    return result;
}

function makeUniqVertexesList(vertexes) {
    return _.uniqWith(vertexes, _.isEqual);
}

function getNewLoops(/*newLoops, oldLoops*/) {

}

module.exports = {
    getMinMaxCorners: getMinMaxCorners,
    findFirstUnselectedUnvisitedPosition: findFirstUnselectedUnvisitedPosition,
    getUnselectedUnvisitedVertexesCount: getUnselectedUnvisitedVertexesCount,
    makeUniqVertexesList: makeUniqVertexesList,
    getNewLoops: getNewLoops
};
