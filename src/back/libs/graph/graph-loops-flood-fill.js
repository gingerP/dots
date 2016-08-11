(function () {
    'use strict';

    var commonUtils = require('./utils/common-utils');
    var convertUtils = require('./utils/convert-utils');
    var loopCheckerUtils = require('./utils/loop-checker-utils');
    var vertexUtils = require('./utils/vertex-utils');
    var WHILE_LIMIT = Infinity;

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
            vertexes: result
        }
    }

    function getLoops(array) {
        console.time('getLoops');
        var prepared = prepareInbound(array);
        var selectedSize = array.length;
        var size = prepared.borders.size;
        var firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
        var isUnbroken;
        if (firstPosition) {
            var unpassVertexesCount = commonUtils.getUnselectedUnvisitedVertexesCount(prepared.vertexes);
            var futureLines = [getFutureLine(firstPosition.x, firstPosition.y, [], prepared.vertexes)];
            var lineIndex = 0;
            var loopIndex = 0;
            var whileLimitIndex = 0;
            var passedLine;
            var loops = [];
            var passed;
            var selected;
            while (unpassVertexesCount > 0) {
                isUnbroken = true;
                lineIndex = 0;
                passed = 0;
                selected = {};
                if (whileLimitIndex) {
                    firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
                    if (firstPosition) {
                        futureLines = [getFutureLine(firstPosition.x, firstPosition.y, [], prepared.vertexes)];
                    } else {
                        break;
                    }
                }
                while (lineIndex < futureLines.length) {
                    passedLine = passLine(lineIndex, futureLines, selected, prepared.vertexes);
                    passed += passedLine.passed;
                    isUnbroken = isUnbroken && !passedLine.isSpill;
                    unpassVertexesCount -= passedLine.passed;
                    //loops[loopIndex].push.apply(loops[loopIndex], passedLine.selected);
                    lineIndex++;
                }
                if (Object.keys(selected).length && isUnbroken) {
                    loops.push({
                        selected: selected,
                        passed: passed
                    });
                }
                whileLimitIndex++;
            }
        }
        console.timeEnd('getLoops');
        console.time('uniq');


        loops.forEach(function(loop) {
            //selected: 743010, passed: 124001
            console.info('selected: %s, passed: %s', Object.keys(loop.selected).length, loop.passed);
        });
        console.timeEnd('uniq');

        /*unBrokenLoops = unBrokenLoops.map(function(list) {
            return commonUtils.makeUniqVertexesList(list);
        });
        unBrokenLoops.forEach(function(list, index) {
            console.info('selected: %s, passed: %s', list.length, passedLoops[index]);
        });
*/
    }

    function passLine(futureLineIndex, futureLines, selected, vertexes) {
        var line = futureLines[futureLineIndex];
        var passed = 0;
        var index = line.pos.y;
        var newFutureLines;
        var isSpill = false;
        var vertex = vertexes[line.pos.x][index];
        while (vertex && index >= 0 && !vertex.isSelected && !vertex.isInFutureLines) {
            vertex.isVisited = true;
            vertex.isInFutureLines = true;
            newFutureLines = getFutureLineForVertex(line.pos.x, index, futureLines, vertexes);
            vertexUtils.applySelectedNeighborsFrom_8_Direction(
                {x: line.pos.x, y: index},
                selected,
                vertexes
            );
            futureLines.push.apply(futureLines, newFutureLines);
            index += line.direction;
            vertex = vertexes[line.pos.x][index];
            passed++;
        }

        if (!vertexes[line.pos.x][index] || !vertexes[line.pos.x][line.pos.y - 1]) {
            isSpill = true;
        }
        return {
            passed: passed,
            isSpill: isSpill
        };
    }

    function hasSpill() {

    }

    function getFutureLineForVertex(x, y, futureLines, vertexes) {
        var result = [];
        var xLimit = vertexes.length;
        var topLine;
        var bottomLine;

        //top
        if (x) {
            topLine = getFutureLine(x - 1, y, futureLines, vertexes);
            if (topLine) {
                result.push(topLine);
            }
        }

        //bottom
        if (x < xLimit - 1) {
            bottomLine = getFutureLine(x + 1, y, futureLines, vertexes);
            if (bottomLine) {
                result.push(bottomLine);
            }
        }

        return result;
    }

    function getFutureLine(x, y, futureLines, vertexes) {
        var line;
        if (!vertexes[x][y].isSelected && !vertexes[x][y].isInFutureLines) {
            line = {
                pos: {
                    x: x,
                    y: y
                },
                direction: getDirection(x, y, vertexes)
            };
            //line.size = getFutureLineSize(x, y, line.direction, vertexes);
        }
        return line;
    }

/*
    function tryToGetVerticalLine(x, y, ) {

    }
*/

    function getDirection(x, y, vertexes) {
        var direction = 1;
        var prev = vertexes[x][y - 1];
        var next = vertexes[x][y + 1];
        var current = vertexes[x][y];
        if (isPrevAndNextNotExist(x, y, vertexes) || (!current.isSelected
            && (isPrevNotExistAndNextIsSelected(x, y, vertexes) || isNextNotExistAndPrevIsSelected(x, y, vertexes)))) {
            direction = 1;
        } else if ((!next || next.isSelected) && !current.isSelected && prev && !prev.isSelected) {
            direction = -1;
        } else if (!next.isSelected && !current.isSelected && (!prev || prev.isSelected)) {
            direction = 1;
        }
        return direction;
    }

    function isPrevAndNextNotExist(x, y, vertexes) {
        return y + 1 >= vertexes[x].length && y <= 0;
    }

    function isPrevNotExistAndNextIsSelected(x, y, vertexes) {
        return y + 1 < vertexes[x].length && vertexes[x][y + 1].isSelected && y <= 0;
    }

    function isNextNotExistAndPrevIsSelected(x, y, vertexes) {
        return y > 0 && vertexes[x][y - 1].isSelected && y + 1 >= vertexes[x].length;
    }

    module.exports = {
        getLoops: getLoops
    };
})();