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

    function convertLoopsLines(lines, shift) {
        return _.map(lines, function (line) {
            line.start.x_ = line.start.x * shift;
            line.start.y_ = line.start.y * shift;
            line.finish.x_ = line.finish.x * shift;
            line.finish.y_ = line.finish.y * shift;
            return line;
        });
    }

    return {
        convertWallPath: convertWallPath,
        convertLoopsLines: convertLoopsLines
    };
});