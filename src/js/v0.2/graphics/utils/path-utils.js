define([
    'lodash'
], function(_) {
    'use strict';

    function newLine(vertexA, vertexB) {
        return [vertexA, vertexB];
    }

    /***********************************************************/

    function getVertexHash(vertex) {
        return vertex[0] + '.' + vertex[1];
    }

    function getLineHash(vertex1, vertex2) {
        return getVertexHash(vertex1) + '.' + getVertexHash(vertex2);
    }

    function createVertexesHashesMap(vertexes) {
        var hashes = {};
        if (vertexes) {
            _.forEach(vertexes, function (item) {
                hashes[getVertexHash(item)] = item;
            });
        }
        return hashes;
    }

    function getExistNeighbors(vertex, vertexesHashMap) {
        var shifts = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        var result = [];
        _.forEach(shifts, function (shift) {
            var position = [vertex[0] + shift[0], vertex[1] + shift[1]],
                positionHash = getVertexHash(position);
            if (vertexesHashMap[positionHash]) {
                result.push(position);
            }
        });
        return result;
    }

    function getVertexLines(vertex, vertexesMap, linesHashes) {
        var neighbors = getExistNeighbors(vertex, vertexesMap);
        var lines = [];
        if (neighbors.length) {
            _.forEach(neighbors, function (neighbor) {
                var lineHashA = getLineHash(vertex, neighbor);
                var lineHashB = getLineHash(neighbor, vertex);
                if (linesHashes.indexOf(lineHashA) === -1 && linesHashes.indexOf(lineHashB) === -1) {
                    lines.push(newLine(vertex, neighbor));
                    linesHashes.push(lineHashA);
                }
            });
        }
        return lines;
    }

    function getUnSortedPath(vertexes) {
        var lines = [];
        var vertexesHashMap = createVertexesHashesMap(vertexes);
        var linesHashes = [];
        for (let vertexIndex = 0; vertexIndex < vertexes.length; vertexIndex++) {
            lines.push.apply(lines, getVertexLines(vertexes[vertexIndex], vertexesHashMap, linesHashes));
        }
        return lines;
    }

    return {
        getUnSortedPath: getUnSortedPath
    };
});
