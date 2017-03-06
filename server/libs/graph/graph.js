'use strict';

var _ = require('lodash');
var PathUtils = require('./utils/path-utils');
var floodLoops = require('./graph-loops-flood-fill');

function getLoopsLinesUnsorted(vertexes) {
    var loopsRaw = floodLoops.getLoops(vertexes);
    return _.map(loopsRaw, function (loopRaw) {
        loopRaw.loopLines = PathUtils.getUnSortedPath(loopRaw.loop);
        return loopRaw;
    });
}

function getLoopAroundDot() {
    var loopsRaw = floodLoops.getLoop(vertexes, vertex);
}

module.exports = {
    getLoops: floodLoops.getLoops,
    getLoop: floodLoops.getLoop,
    getLoopAroundDot: getLoopAroundDot,
    getLoopsLinesUnsorted: getLoopsLinesUnsorted
};
