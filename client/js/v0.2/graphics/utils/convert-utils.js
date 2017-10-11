define([
    'lodash'
], function (_) {
    'use strict';

    function convertWallPath(path) {
        var result = [];
        _.forEach(path, function (pathItem, index) {
            if (path[index + 1]) {
                result.push({
                    start: pathItem,
                    finish: path[index + 1]
                });
            }
        });
        return result;
    }

    /**
     * @param {{start: Dot, finish: Dot}[]} lines
     * @param {number} shift
     * @param {number} offset
     * @returns {{PathLine[]}}
     */
    function convertLoopsLines(lines, shift, offset) {
        return _.map(lines, function (line) {
            line.start.x_ = line.start.x * shift + offset;
            line.start.y_ = line.start.y * shift + offset;
            line.finish.x_ = line.finish.x * shift + offset;
            line.finish.y_ = line.finish.y * shift + offset;
            return line;
        });
    }

    return {
        convertWallPath: convertWallPath,
        convertLoopsLines: convertLoopsLines
    };
});