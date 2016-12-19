define([
    'lodash',
    'common/common-constants',
    'graphics/utils/path-utils',
    'graphics/utils/convert-utils',
    'graphics/common/graphics-constants'
], function (_, CommonConstants,
             PathUtils, ConvertUtils, GraphicsConstants) {
    'use strict';

    var api,
        DEFAULT_MULTIPLIER = 16,
        DOT = GraphicsConstants.GAME_PANE.DOT,
        TABLE = GraphicsConstants.GAME_PANE.TABLE;

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

    function getDotId(dotXY) {
        return 'circle_' + dotXY.x + '_' + dotXY.y;
    }

    function getSelectionDotId(dotXY) {
        return 'circle_' + dotXY.x + '_' + dotXY.y + '_selection';
    }

    function getLineId(startCircle, finCircle) {
        return 'line_' +
            startCircle.x_ + '_' +
            startCircle.y_ + '_' +
            finCircle.x_ + '_' +
            finCircle.y_;
    }

    function prepareCirclesData(data, step, offset) {
        return _.map(data, function (vertex) {
            vertex.id = getDotId(vertex);
            vertex.radius = DOT.RADIUS;
            vertex.x_ = vertex.x * step + offset;
            vertex.y_ = vertex.y * step + offset;
            return vertex;
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
                        PathUtils.getUnSortedPath(loopData.loop),
                        shift,
                        offset
                    )
                );
            }
        });
        return result;
    }

    function getUnitSize() {
        var size = window.getComputedStyle(document.body).fontSize;
        var result = DEFAULT_MULTIPLIER;

        if (size.endsWith('px')) {
            result = _.parseInt(size);
        }

        return result;
    }

    function getPaneSize(xNum, yNum, unit, offset) {
        return {
            width: xNum * unit + offset,
            height: yNum * unit + offset
        };
    }

    function getVertexPosition(vertexXY) {
        return {
            x: vertexXY.x * TABLE.STEP + TABLE.OFFSET,
            y: vertexXY.y * TABLE.STEP + TABLE.OFFSET
        };
    }

    function getColorValue(colorCode) {
        var color = CommonConstants.PLAYER.COLORS[colorCode];

        return color ? color : colorCode;
    }

    api = {
        createPaneGridData: createPaneGridData,
        getNotExistingPath: getNotExistingPath,
        getDotId: getDotId,
        getSelectionDotId: getSelectionDotId,
        getLineId: getLineId,
        prepareCirclesData: prepareCirclesData,
        generateSelectorStringFromDots: generateSelectorStringFromDots,
        getFilteredAndConvertedLoops: getFilteredAndConvertedLoops,
        getUnitSize: getUnitSize,
        getPaneSize: getPaneSize,
        getVertexPosition: getVertexPosition,
        getColorValue: getColorValue
    };

    return api;
});
