'use strict';

var creationUtils = require('./creation-utils');

function convertInbound(sizeX, sizeY, minX, minY, sourceData) {
    var workData = createDefaultArray(sizeX, sizeY);
    sourceData.forEach(function (data) {
        workData[data.x - minX][data.y - minY].isSelected = true;
    });
    return workData;
}

function createVertexItem(/*extendData*/) {
    return {
        isInFutureLines: false,
        isSelected: false,
        isVisited: false
    };
}

function createDefaultArray(xSize, ySize) {
    var result = [];
    var xIndex = 0;
    var yIndex = 0;
    for (; xIndex < xSize; xIndex++) {
        result[xIndex] = [];
        for (yIndex = 0; yIndex < ySize; yIndex++) {
            result[xIndex].push(createVertexItem());
        }
    }
    return result;
}

function convertLoopToOutbound(loop, xShift, yShift) {
    return loop.map(function (loopItem) {
        return creationUtils.newVertex(loopItem.x + xShift, loopItem.y + yShift);
    });
}

function convertVertexAsObjectToArray(object) {
    var result = [];
    var key;
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            result.push(object[key].pos);
        }
    }
    return result;
}

module.exports = {
    convertInbound: convertInbound,
    convertLoopToOutbound: convertLoopToOutbound,
    createVertexItem: createVertexItem,
    convertVertexAsObjectToArray: convertVertexAsObjectToArray
};
