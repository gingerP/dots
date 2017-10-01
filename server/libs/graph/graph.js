'use strict';

const _ = require('lodash');
const PathUtils = require('./utils/path-utils');
const FloodLoops = require('./graph-loops-flood-fill');
const VertexUtils = require('./utils/vertex-utils');

/**
 * @param {Dot[]} vertexes
 * @returns LoopCache[]
 */
function getLoopsLinesUnsorted(vertexes) {
    var loopsRaw = FloodLoops.getLoops(vertexes);
    return _.map(loopsRaw, function (loopRaw) {
        loopRaw.loopLines = PathUtils.getUnSortedPath(loopRaw.loop);
        return loopRaw;
    });
}

/**
 * @param {Dot[]} vertexes all vertexes, including vertex, immutable
 * @param {Dot} vertex , immutable
 * @returns LoopCache[]
 */
function getLoopsWithVertexInBorder(vertexes, vertex) {
    let result = [];
    const holesGroups = VertexUtils.getHolesFromNeighborsAsGroups(vertex, vertexes);
    if (holesGroups.length) {
        let index = holesGroups.length - 1;
        holesGroupsLoop:while (index >= 0) {
            const holesGroup = holesGroups[index];
            index--;
            //if result are not empty we should check if first vertex of current group contained in trapped dots
            if (result.length) {
                let loopIndex = result.length - 1;
                while(loopIndex >= 0) {
                    const loop = result[loopIndex];
                    if (_.findIndex(loop.trappedDots, holesGroup[0]) !== -1) {
                        continue holesGroupsLoop;
                    }
                    loopIndex--;
                }
            }
            const loops = FloodLoops.getLoop(vertexes, holesGroup[0]);
            if (loops && loops.length) {
                result = result.concat(loops);
            }
        }
    }
    return result;
}

module.exports = {
    getLoops: FloodLoops.getLoops,
    getLoop: FloodLoops.getLoop,
    getLoopsWithVertexInBorder: getLoopsWithVertexInBorder,
    getLoopsLinesUnsorted: getLoopsLinesUnsorted
};
