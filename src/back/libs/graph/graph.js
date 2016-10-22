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


module.exports = {
    getLoopsData: floodLoops.getLoops,
    getLoopsLinesUnsorted: getLoopsLinesUnsorted
};
