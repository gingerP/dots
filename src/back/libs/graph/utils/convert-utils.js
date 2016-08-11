(function() {
    'use strict';

    function convertInbound(sizeX, sizeY, minX, minY, sourceData) {
        var workData = createDefaultArray(sizeX, sizeY);
        var xInd = 0;
        var line;
        sourceData.forEach(function (data) {
            workData[data.x - minX][data.y - minY].isSelected = true;
        });
        return workData;
    }

    function createDefaultArray(xSize, ySize) {
        var result = [];
        var xIndex = 0;
        var yIndex = 0;
        for(; xIndex < xSize; xIndex++) {
            result[xIndex] = [];
            for(yIndex = 0; yIndex < ySize; yIndex++) {
                result[xIndex].push(createVertexItem());
            }
        }
        return result;
    }

    function createVertexItem(extendData) {
        return {
            isInFutureLines: false,
            isSelected: false,
            isVisited: false,
            isDeadlock: false,
            isInPath: false,
            extendData: extendData || {}
        }
    }

    function convertLoopToOutbound(loop, xShift, yShift) {
        return loop.map(function (loopItem) {
            return {
                x: loopItem.x + xShift,
                y: loopItem.y + yShift
            }
        });
    }

    module.exports = {
        convertInbound: convertInbound,
        convertLoopToOutbound: convertLoopToOutbound,
        createVertexItem: createVertexItem
    };

})();