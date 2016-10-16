define([
    'lodash'
], function (_) {
    'use strict';

    var api;

    function createPaneGridData(xNum, yNum, step, offset) {
        var result = [];
        var x = 0;
        var y = 0;
        var height = step * (yNum - 1);
        var width = step * (xNum - 1);
        for (; x < xNum; x++) {
            //vertical line
            result.push({
                x1: x * step + offset,
                y1: offset / 2,
                x2: x * step + offset,
                y2: offset * 1.5 + height
            });
        }
        for (; y < yNum; y++) {
            //horizontal line
            result.push({
                x1: offset / 2,
                y1: y * step + offset,
                x2: offset * 1.5 + width,
                y2: y * step + offset
            });
        }
        return result;
    }

    function convertWallPath(path) {
        var result = [];
        path.forEach(function (pathItem, index) {
            if (path[index + 1]) {
                result.push({
                    start: pathItem,
                    finish: path[index + 1]
                });
            }
        });
        return result;
    }

    function getNotExistingPath(path) {
        var result = [];
        path.forEach(function (item) {
            if (!isLineExist(item.start, item.finish)) {
                result.push(item);
            }
        });
        return result;
    }

    function isLineExist(lines, startCircle, finCircle) {
        var id = getLineId(startCircle, finCircle);
        return lines.some(function (line) {
            return line.id === id;
        });
    }

    function getLineId(startCircle, finCircle) {
        return 'line_' +
            startCircle.x_ + '_' +
            startCircle.y_ + '_' +
            finCircle.x_ + '_' +
            finCircle.y_;
    }

    function prepareCirclesData(data, step, offset) {
        return _.map(data, function (dataItem) {
            dataItem.x_ = dataItem.x * step + offset;
            dataItem.y_ = dataItem.y * step + offset;
            return dataItem;
        });
    }

    function generateSelectorStringFromDots(dots, prefix) {
        var dotsPrepared = _.isArray(dots) ? dots : [dots];
        return _.map(dotsPrepared, function (dot) {
            return (prefix || '') + '#circle_' + dot.x + '_' + dot.y;
        }).join(',');
    }

    api = {
        createPaneGridData: createPaneGridData,
        convertWallPath: convertWallPath,
        getNotExistingPath: getNotExistingPath,
        getLineId: getLineId,
        prepareCirclesData: prepareCirclesData,
        generateSelectorStringFromDots: generateSelectorStringFromDots
    };

    return api;
});
