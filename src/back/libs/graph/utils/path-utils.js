'use strict';

function createLineHash(vertex1, vertex2) {
    return createVertexHash(vertex1) + '.' + createVertexHash(vertex2);
}

function createVertexHash(vertex) {
    return vertex[0] + '.' + vertex[1];
}

function createVertexesHashesMap(vertexes) {
    var hashes = {};
    if (vertexes) {
        vertexes.forEach(function(item) {
            hashes[createVertexHash(item)] = item;
        });
    }
    return hashes;
}

function get8neighbors(vertex, hashes) {

}

function getUnSortedPath(vertexes) {
    var lines = [];
    var hashes = createVertexesHashesMap(vertexes);
    for(let hash in hashes) {

    }



    return lines;
}

module.exports = {
    getUnSortedPath: getUnSortedPath
};