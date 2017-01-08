'use strict';
const commonUtils = require('./utils/common-utils');
const convertUtils = require('./utils/convert-utils');
const vertexUtils = require('./utils/vertex-utils');
const CreationUtils = require('./utils/creation-utils');
const directionUtils = require('./utils/direction-utils');
const DIRECTIONS = require('./utils/directions');
const DIRECTIONS_FORWARD = DIRECTIONS.FORWARD;
const DIRECTIONS_BACKWARD = DIRECTIONS.BACKWARD;
const DIRECTIONS_NOWHERE = DIRECTIONS.NOWHERE;
const DIRECTIONS_BOTH_WAYS = DIRECTIONS.BOTH_WAYS;

function getLoops(array) {
    var prepared = prepareInbound(array);
    var firstPosition = commonUtils.findFirstUnselectedUnvisitedPosition(prepared.vertexes);
    var isUnbroken;
    var loops = [];
    var unpassVertexesCount = commonUtils.getUnselectedUnvisitedVertexesCount(prepared.vertexes);
    var futureLines;
    var lineIndex;
    var whileLimitIndex;
    var passedLine;
    var passed;
    var selected;
    var trappedDots;
    if (firstPosition) {
        unpassVertexesCount = commonUtils.getUnselectedUnvisitedVertexesCount(prepared.vertexes);
        futureLines = [getFutureLine(firstPosition.x, firstPosition.y, prepared.vertexes)];
        lineIndex = 0;
        whileLimitIndex = 0;
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
    var anotherResultOfPassage;
    var direction = line.direction;

    futureLines[futureLineIndex] = null;
    futureLines.length--;

    if (direction === DIRECTIONS_FORWARD ||
        direction === DIRECTIONS_BACKWARD ||
        direction === DIRECTIONS_NOWHERE) {
        resultOfPassage = passLineWithSpecificDirection(
            line, direction, futureLines, selected, vertexes);
    } else if (direction === DIRECTIONS_BOTH_WAYS) {
        resultOfPassage = passLineWithSpecificDirection(
            line, DIRECTIONS_FORWARD, futureLines, selected, vertexes, false);
        anotherResultOfPassage = passLineWithSpecificDirection(
            line, DIRECTIONS_BACKWARD, futureLines, selected, vertexes, true);
        resultOfPassage.passed += anotherResultOfPassage.passed;
        resultOfPassage.passedDots.push.apply(resultOfPassage.passedDots, anotherResultOfPassage.passedDots);
        resultOfPassage.isSpill = resultOfPassage.isSpill || anotherResultOfPassage.isSpill;
    }

    return resultOfPassage;
}

function passLineWithSpecificDirection(line, direction, futureLines, selected, vertexes, isSkipFirst) {
    var index = line.pos.y + (isSkipFirst ? direction : 0);
    var newFutureLines;
    var isSpill = false;
    var posX = line.pos.x;
    var vertex = vertexes[posX][index];
    var passedDots = [];
    var pos = CreationUtils.newVertex(posX, index);
    saveNextPosAsSelected(pos, direction || -1, vertexes, selected);
    while (vertex && index >= 0 && !vertex.isSelected && !vertex.isInFutureLines) {
        pos = CreationUtils.newVertex(posX, index);
        vertex.isVisited = true;
        vertex.isInFutureLines = true;
        newFutureLines = getFutureLineForVertex(posX, index, vertexes);
        if (!isSpill) {
            isSpill = vertexUtils.hasSpill(pos, vertexes);
        }
        //console.info('x: %s, y: %s', posX, index);
        vertexUtils.applySelectedNeighborsFrom_2_Direction(
            pos,
            selected,
            vertexes
        );
        /*vertexUtils.applySelectedNeighborsFrom_8_Direction(
            pos,
            selected,
            vertexes
        );*/
        passedDots.push(pos);
        futureLines.push.apply(futureLines, newFutureLines);
        index += direction;
        vertex = vertexes[posX][index];
    }
    if (vertex) {
        saveNextPosAsSelected(pos, direction || 1, vertexes, selected);
    }

    if (!isSpill && (!vertexes[posX][index] || !vertexes[posX][line.pos.y - 1])) {
        isSpill = true;
    }
    return {
        passedDots: passedDots,
        passed: passedDots.length,
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
            pos: CreationUtils.newVertex(x, y),
            direction: directionUtils.getDirection(x, y, vertexes)
        };
    }
    return line;
}

function saveNextPosAsSelected(currentPos, direction, vertexes, selected) {
    var nextPos = CreationUtils.newVertex(
        currentPos.x,
        currentPos.y + (direction || -1)
    );
    if (!vertexes[nextPos.x]) {
        return selected;
    }
    let vertex = vertexes[nextPos.x][nextPos.y];
    let key = nextPos.x + '.' + nextPos.y;
    if (vertex && !selected.hasOwnProperty(key) && vertex.isSelected) {
        selected[key] = vertex;
        vertex.pos = nextPos;
    }
    return selected;
}

module.exports = {
    getLoops: getLoops
};
