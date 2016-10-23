define([
    'lodash',
    'graphics/utils/path-utils',
    'graphics/utils/convert-utils'
], function (_, PathUtils, ConvertUtils) {
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

    function getNotExistingPath(path, lines) {
        var result = [];
        _.forEach(path, function (item) {
            if (!isLineExist(lines, item.start, item.finish) && !isLineExist(lines, item.finish, item.start)) {
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

    function getFilteredAndConvertedLoops(loops, shift, offset) {
        var result = [];
        _.forEach(loops, function (loopData) {
            if (loopData.trappedDots && loopData.trappedDots.length) {
                result.push(
                    ConvertUtils.convertLoopsLines(
                        PathUtils.getUnSortedPath(loopData.dots),
                        shift,
                        offset
                    )
                );
            }
        });
        return result;
    }

    api = {
        createPaneGridData: createPaneGridData,
        getNotExistingPath: getNotExistingPath,
        getLineId: getLineId,
        prepareCirclesData: prepareCirclesData,
        generateSelectorStringFromDots: generateSelectorStringFromDots,
        getFilteredAndConvertedLoops: getFilteredAndConvertedLoops
    };

    return api;
});
