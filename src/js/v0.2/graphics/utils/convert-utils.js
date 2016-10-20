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

    function convertLoopsLines(lines) {
        return _.map(lines, function (line) {
            return {
                start: {
                    x_: line[0][0],
                    y_: line[0][1]
                },
                finish: {
                    x_: line[1][0],
                    y_: line[1][1]
                }
            };
        });
    }

    return {
        convertWallPath: convertWallPath,
        convertLoopsLines: convertLoopsLines
    };
});