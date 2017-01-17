'use strict';

var _ = require('lodash');

function getMinMaxCorners(dataArray) {
    var minX = dataArray[0].x;
    var minY = dataArray[0].y;
    var maxX = dataArray[0].x;
    var maxY = dataArray[0].y;
    var index = 0;
    var data;
    for(; index < dataArray.length; index++) {
        data = dataArray[index];
        if (data.x > maxX) {
            maxX = data.x;
        }
        if (data.y > maxY) {
            maxY = data.y;
        }
        if (data.x < minX) {
            minX = data.x;
        }
        if (data.y < minY) {
            minY = data.y;
        }
    }
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
    var vertex;
    for (; xIndex < array.length; xIndex++) {
        for (; yIndex < array[xIndex].length; yIndex++) {
            vertex = array[xIndex][yIndex];
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
    var vertex;
    while (x < vertexes.length) {
        y = 0;
        while (y < vertexes[x].length) {
            vertex = vertexes[x][y];
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
