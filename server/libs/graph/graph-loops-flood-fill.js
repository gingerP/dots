'use strict';
const commonUtils = require('./utils/common-utils');
const convertUtils = require('./utils/convert-utils');
const vertexUtils = require('./utils/vertex-utils');
const creationUtils = require('./utils/creation-utils');
const directionUtils = require('./utils/direction-utils');
const DIRECTIONS = require('./utils/directions');

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
                trappedDots.push.apply(trappedDots, passedLine.passedDots);
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
    var resultOfPassage;

    futureLines[futureLineIndex] = null;
    futureLines.length--;

    if (line.direction === DIRECTIONS.FORWARD ||
        line.direction === DIRECTIONS.BACKWARD ||
        line.direction === DIRECTIONS.NOWHERE) {
        resultOfPassage = passLineWithSpecificDirection(line, line.direction, futureLines, selected, vertexes);
    } else if (line.direction === DIRECTIONS.BOTH_WAYS) {
        resultOfPassage = passLineWithSpecificDirection(
            line, DIRECTIONS.FORWARD, futureLines, selected, vertexes, false
        );
        let anotherResultOfPassage = passLineWithSpecificDirection(
            line, DIRECTIONS.BACKWARD, futureLines, selected, vertexes, true
        );
        resultOfPassage.passed += anotherResultOfPassage.passed;
        resultOfPassage.passedDots.push.apply(resultOfPassage.passedDots, anotherResultOfPassage.passedDots);
        resultOfPassage.isSpill = resultOfPassage.isSpill || anotherResultOfPassage.isSpill;
    }

    return resultOfPassage;
}

function passLineWithSpecificDirection(line, direction, futureLines, selected, vertexes, isSkipFirst) {
    var passed = 0;
    var index = line.pos.y + (isSkipFirst ? direction : 0);
    var newFutureLines;
    var isSpill = false;
    var vertex = vertexes[line.pos.x][index];
    var passedDots = [];
    while (vertex && index >= 0 && !vertex.isSelected && !vertex.isInFutureLines) {
        vertex.isVisited = true;
        vertex.isInFutureLines = true;
        newFutureLines = getFutureLineForVertex(line.pos.x, index, vertexes);
        if (!isSpill) {
            isSpill = vertexUtils.hasSpill(creationUtils.newVertex(line.pos.x, index), vertexes);
        }
        vertexUtils.applySelectedNeighborsFrom_8_Direction(
            creationUtils.newVertex(line.pos.x, index),
            selected,
            vertexes
        );
        passedDots.push(creationUtils.newVertex(line.pos.x, index));
        futureLines.push.apply(futureLines, newFutureLines);
        index += direction;
        vertex = vertexes[line.pos.x][index];
        passed++;
    }

    if (!isSpill && (!vertexes[line.pos.x][index] || !vertexes[line.pos.x][line.pos.y - 1])) {
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
    var vertex = vertexes[x][y];
    if (!vertex.isSelected && !vertex.isInFutureLines) {
        line = {
            pos: creationUtils.newVertex(x, y),
            direction: directionUtils.getDirection(x, y, vertexes)
        };
    }
    return line;
}

module.exports = {
    getLoops: getLoops
};
