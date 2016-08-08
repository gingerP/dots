(function () {
    'use strict';

    var commonUtils = require('./utils/common-utils');
    var convertUtils = require('./utils/convert-utils');
    var loopCheckerUtils = require('./utils/loop-checker-utils');
    var vertexUtils = require('./utils/vertex-utils');

    function prepareInbound(array) {
        var borders = commonUtils.getMinMaxCorners(array);
        var minX = borders.min.x;
        var minY = borders.min.y;
        var result = convertUtils.convertInbound(
            borders.max.x - minX + 1,
            borders.max.y - minY + 1,
            minX,
            minY,
            array);
        return {
            borders: borders,
            data: result
        }
    }

    function getLoops(array) {
        console.time('getLoops');
        var prepared = prepareInbound(array);
        var selectedSize = array.length;
        var size = prepared.borders.size;
        var firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.data);
        var unpassVertexesCount = commonUtils.getUnselectedUnvisitedVertexesCount(prepared.data);
        var futureLines = [{pos: firstPosition, direction: 1}];
        var index = 0;
        var loopIndex = 0;
        var whileLimitIndex = 0;
        var WHILE_LIMIT = 10000;
        var passedLine;
        var loops = [];
        while (unpassVertexesCount > 0 && index < size && whileLimitIndex < WHILE_LIMIT) {
            index = 0;
            loops.push([]);
            if (whileLimitIndex) {
                firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.data);
                futureLines = [{pos: firstPosition, direction: 1}];
            }
            while (index < futureLines.length && index < size) {
                passedLine = passLine(0, futureLines, prepared.data);
                unpassVertexesCount -= passedLine.passed;
                loops[loopIndex].push.apply(loops[loopIndex], passedLine.selected);
                index++;
            }
            if (loops[loopIndex].length) {
                loopIndex++;
            }
            whileLimitIndex++;
        }
        console.timeEnd('getLoops');
    }

    function passLine(futureLineIndex, futureLines, vertexes) {
        var line = futureLines[futureLineIndex];
        var passed = 0;
        var selected = [];
        var limit = vertexes[line.pos.x].length;
        var index = line.pos.y;
        var newFutureLines;
        while (index < limit && index >= 0 && !vertexes[line.pos.x][index].isSelected) {
            vertexes[line.pos.x][index].isVisited = true;
            newFutureLines = getFutureLine(line.pos.x, index, vertexes);
            selected.push.apply(selected, vertexUtils.getSelectedNeighborsFrom4Direction({x: line.pos.x, y: index}, vertexes));
            futureLines.push.apply(futureLines, newFutureLines);
            index += line.direction;
            passed++;
        }
        return {
            passed: passed,
            selected: selected
        };
    }

    function getFutureLine(x, y, vertexes) {
        var result = [];
        var xLimit = vertexes.length;
        //top
        if (x
            && !vertexes[x - 1][y].isSelected) //if top vertex is unselected
        {
            result.push({
                pos: {
                    x: x - 1,
                    y: y
                },
                direction: getDirection(x - 1, y, vertexes)
            });

        }

        //bottom
        if (x < xLimit
            && !vertexes[x + 1][y].isSelected) //if bottom vertex is unselected
        {
            result.push({
                pos: {
                    x: x + 1,
                    y: y
                },
                direction: getDirection(x + 1, y, vertexes)
            });
        }
        return result;
    }

    function getDirection(x, y, vertexes) {
        var direction = 0;
        if (isPrevAndNextNotExist(x, y, vertexes) || (!vertexes[x][y].isSelected
            && (isPrevNotExistAndNextIsSelected(x, y, vertexes) || isNextNotExistAndPrevIsSelected(x, y, vertexes)))) {
            return 0;
        }
        if ((!vertexes[x][y + 1] || vertexes[x][y + 1].isSelected) && !vertexes[x][y].isSelected && vertexes[x][y - 1] && !vertexes[x][y - 1].isSelected) {
            direction = -1;
        } else if (!vertexes[x][y + 1].isSelected && !vertexes[x][y].isSelected && vertexes[x][y - 1].isSelected) {
            direction = 1;
        }
        return direction;
    }

    function isPrevAndNextNotExist(x, y, vertexes) {
        return !vertexes[x][y + 1] && !vertexes[x][y - 1];
    }

    function isPrevNotExistAndNextIsSelected(x, y, vertexes) {
        return vertexes[x][y + 1] && vertexes[x][y + 1].isSelected && !vertexes[x][y - 1];
    }

    function isNextNotExistAndPrevIsSelected(x, y, vertexes) {
        return vertexes[x][y - 1] && vertexes[x][y - 1].isSelected && !vertexes[x][y + 1];
    }

    function getSelectedNeighbors(x, y, vertexes) {
        var result = [];
        if (vertexes[x + 1][y].isSelected) {
            result.push(vertexes[x + 1][y]);
        }
        if (vertexes[x][y + 1].isSelected) {
            result.push(vertexes[x][y + 1]);
        }
        if (vertexes[x + 1][y].isSelected) {
            result.push(vertexes[x + 1][y]);
        }
        return result;
    }

    module.exports = {
        getLoops: getLoops
    };
})();