(function () {
    'use strict';

    var commonUtils = require('./utils/common-utils');
    var convertUtils = require('./utils/convert-utils');
    var loopCheckerUtils = require('./utils/loop-checker-utils');
    var vertexUtils = require('./utils/vertex-utils');
    var WHILE_LIMIT = 10000;

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
            var futureLines = [].concat(getFutureLine(firstPosition.x, firstPosition.y, [], prepared.vertexes));
            var lineIndex = 0;
            var loopIndex = 0;
            var whileLimitIndex = 0;
            var passedLine;
            var loops = [[]];
            var unBrokenLoops = [];
            while (unpassVertexesCount > 0 && whileLimitIndex < WHILE_LIMIT) {
                isUnbroken = true;
                lineIndex = 0;
                if (whileLimitIndex) {
                    firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
                    if (firstPosition) {
                        futureLines = [].concat(getFutureLine(firstPosition.x, firstPosition.y, [], prepared.vertexes));
                    } else {
                        break;
                    }
                }
                while (lineIndex < futureLines.length && lineIndex < WHILE_LIMIT) {
                    passedLine = passLine(lineIndex, futureLines, prepared.vertexes);
                    isUnbroken = isUnbroken && !passedLine.isSpill;
                    unpassVertexesCount -= passedLine.passed;
                    loops[loopIndex].push.apply(loops[loopIndex], passedLine.selected);
                    lineIndex++;
                }
                if (loops[loopIndex].length && isUnbroken) {
                    unBrokenLoops.push(loops[loopIndex]);
                }
                if (loops[loopIndex].length) {
                    loops.push([]);
                    loopIndex++;
                }
                whileLimitIndex++;
            }
        }
        console.timeEnd('getLoops');
        unBrokenLoops = unBrokenLoops.map(function(list) {
            return commonUtils.makeUniqVertexesList(list);
        });
        return unBrokenLoops.length ? unBrokenLoops[0]: [];
    }

    function passLine(futureLineIndex, futureLines, vertexes) {
        var line = futureLines[futureLineIndex];
        var passed = 0;
        var selected = [];
        var limit = vertexes[line.pos.x].length;
        var index = line.pos.y;
        var newFutureLines;
        var isSpill = false;
        while (passed < line.size && index >= 0 && !vertexes[line.pos.x][index].isSelected) {
            vertexes[line.pos.x][index].isVisited = true;
            newFutureLines = getFutureLineForVertex(line.pos.x, index, futureLines, vertexes);
            selected.push.apply(selected, vertexUtils.getSelectedNeighborsFrom_8_Direction({
                x: line.pos.x,
                y: index
            }, vertexes));
            futureLines.push.apply(futureLines, newFutureLines);
            index += line.direction;
            passed++;
        }
        if (passed === line.size && (!vertexes[line.pos.x][index] || !vertexes[line.pos.x][line.pos.y - 1])) {
            isSpill = true;
        }
        return {
            passed: passed,
            selected: selected,
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
        if (isFutureLineAvailable(x, y, futureLines, vertexes)) {
            line = {
                pos: {
                    x: x,
                    y: y
                },
                direction: getDirection(x, y, vertexes)
            };
            line.size = getFutureLineSize(x, y, line.direction, vertexes);
        }
        return line;
    }

    function isFutureLineAvailable(x, y, futureLines, vertexes) {
        var result = !vertexes[x][y].isSelected;
        var lineIndex = 0;
        var line;
        if (result) {
            while (lineIndex < futureLines.length) {
                line = futureLines[lineIndex];
                if (line.pos.x === x &&
                    (line.direction === 1 && y >= line.pos.y && y <= line.pos.y + line.size)
                    || (line.direction === -1 && y <= line.pos.y && y >= line.pos.y - line.size)
                ) {
                    result = false;
                    break;
                }
                lineIndex++;
            }
        }
        return result;
    }

    function getFutureLineSize(x, y, direction, vertexes) {
        var index = y;
        var result = 0;
        while (vertexes[x][index] && !vertexes[x][index].isSelected && result < WHILE_LIMIT) {
            index += direction;
            result++;
        }
        return result;
    }

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