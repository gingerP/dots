'use strict';

function isCorrectNumbersOfVertexes(loop) {
    return loop.length > 3;
}

function isLoopSurroundsVertexes(loop, vertexes) {
    if (vertexes) {
        return vertexes.some(function (vertex) {
            return isVertexInsideLoop(loop, vertex);
        });
    }
    return false;
}

function isStartAndFinishNeighbor(loop) {
    return loop.length > 3 && loop.every(function (item, index) {
            var next = loop[index + 1] || loop[0];
            return Math.abs(item.x - next.x) <= 1 &&
                Math.abs(item.y - next.y) <= 1;
        });
}

function isVertexInsideLoop(loop, vertex) {
    var left = 0;
    var right = 0;

    function add(item) {
        if (item.x > vertex.x) {
            right++;
        } else if (item.x < vertex.x) {
            left++;
        }
    }

    loop.forEach(function (current, index) {
        var next;
        var prev;
        var isIncrease = false;
        if (current.y === vertex.y) {
            next = loop[index + 1] ? loop[index + 1] : loop[0];
            prev = loop[index - 1] ? loop[index - 1] : loop[loop.length - 1];
            if (prev.y < current.y && next.y > current.y
                || prev.y > current.y && next.y < current.y) {
                add(current);
            } else if (prev.y < current.y && next.y < current.y
                || prev.y > current.y && next.y > current.y) {
                //tangent
            } else if ((prev.y < current.y || prev.y > current.y) && next.y === vertex.y) {
                isIncrease = prev.y < current.y;
            } else if ((next.y < current.y || next.y > current.y) && prev.y === vertex.y) {
                if (isIncrease && next.y > current.y || !isIncrease && next.y > current.y) {
                    add(current);
                }
            }
        }
    });
    return left && right && Math.floor(right / 2) !== right / 2 && Math.floor(left / 2) !== left / 2;
}

module.exports = {
    isCorrectNumbersOfVertexes: isCorrectNumbersOfVertexes,
    isLoopSurroundsVertexes: isLoopSurroundsVertexes,
    isStartAndFinishNeighbor: isStartAndFinishNeighbor,
    isVertexInsideLoop: isVertexInsideLoop
};

