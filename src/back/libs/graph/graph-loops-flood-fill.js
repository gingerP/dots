'use strict';

const commonUtils = require('./utils/common-utils');
const convertUtils = require('./utils/convert-utils');
const vertexUtils = require('./utils/vertex-utils');
const creationUtils = require('./utils/creation-utils');

function getLoops(array) {
    var prepared = prepareInbound(array);
    var firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
    var isUnbroken;
    var loops = [];
    if (firstPosition) {
        let unpassVertexesCount = commonUtils.getUnselectedUnvisitedVertexesCount(prepared.vertexes);
        let futureLines = [getFutureLine(firstPosition.x, firstPosition.y, prepared.vertexes)];
        let lineIndex = 0;
        let whileLimitIndex = 0;
        let passedLine;
        let passed;
        let selected;
        let trappedDots;
        while (unpassVertexesCount > 0) {
            isUnbroken = true;
            lineIndex = 0;
            passed = 0;
            selected = {};
            trappedDots = [];
            if (whileLimitIndex) {
                firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
                if (firstPosition) {
                    futureLines = [getFutureLine(firstPosition.x, firstPosition.y, prepared.vertexes)];
                } else {
                    break;
                }
            }
            while (futureLines.length && lineIndex < futureLines.length && lineIndex > -1) {
                passedLine = passLine(lineIndex, futureLines, selected, prepared.vertexes);
                passed += passedLine.passed;
                isUnbroken = isUnbroken && !passedLine.isSpill;
                unpassVertexesCount -= passedLine.passed;
                trappedDots = trappedDots.concat(passedLine.passedDots);
                lineIndex = futureLines.length - 1;
            }
            if (Object.keys(selected).length && isUnbroken) {
                loops.push({
                    loop: convertUtils.convertVertexAsObjectToArray(selected),
                    passed: passed,
                    trappedDots: trappedDots
                });
            }
            whileLimitIndex++;
        }
    }
    return prepareOutBound(loops, prepared.shift);
}

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
        vertexes: result,
        shift: {
            x: minX,
            y: minY
        }
    };
}

function prepareOutBound(loops, shift) {
    if (loops && loops.length) {
        for (let loopIndex = 0; loopIndex < loops.length; loopIndex++) {
            let loop = loops[loopIndex];
            loop.loop = updateShifts(loop.loop, shift);
            loop.trappedDots = updateShifts(loop.trappedDots, shift);
        }
    }
    return loops;
}

function updateShifts(dots, shifts) {
    return dots.map(function (dot) {
        dot.x += shifts.x;
        dot.y += shifts.y;
        return dot;
    });
}

function passLine(futureLineIndex, futureLines, selected, vertexes) {
    var line = futureLines[futureLineIndex];
    var passed = 0;
    var index = line.pos.y;
    var newFutureLines;
    var isSpill = false;
    var vertex = vertexes[line.pos.x][index];
    var passedDots = [];
    futureLines[futureLineIndex] = null;
    futureLines.length--;
    while (vertex && index >= 0 && !vertex.isSelected && !vertex.isInFutureLines) {
        vertex.isVisited = true;
        vertex.isInFutureLines = true;
        newFutureLines = getFutureLineForVertex(line.pos.x, index, vertexes);
        isSpill = vertexUtils.hasSpill(creationUtils.newVertex(line.pos.x, index), vertexes);
        vertexUtils.applySelectedNeighborsFrom_8_Direction(
            creationUtils.newVertex(line.pos.x, index),
            selected,
            vertexes
        );
        passedDots.push(creationUtils.newVertex(line.pos.x, index));
        futureLines.push.apply(futureLines, newFutureLines);
        index += line.direction;
        vertex = vertexes[line.pos.x][index];
        passed++;
    }

    if (!isSpill && !vertexes[line.pos.x][index] || !vertexes[line.pos.x][line.pos.y - 1]) {
        isSpill = true;
    }
    return {
        passedDots: passedDots,
        passed: passed,
        isSpill: isSpill
    };
}

function getFutureLineForVertex(x, y, vertexes) {
    var result = [];
    var xLimit = vertexes.length;
    var topLine;
    var bottomLine;

    //left
    if (x) {
        topLine = getFutureLine(x - 1, y, vertexes);
        if (topLine) {
            result.push(topLine);
        }
    }

    //right
    if (x < xLimit - 1) {
        bottomLine = getFutureLine(x + 1, y, vertexes);
        if (bottomLine) {
            result.push(bottomLine);
        }
    }

    return result;
}

function getFutureLine(x, y, vertexes) {
    var line;
    if (!vertexes[x][y].isSelected && !vertexes[x][y].isInFutureLines) {
        line = {
            pos: creationUtils.newVertex(x, y),
            direction: getDirection(x, y, vertexes)
        };
    }
    return line;
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
