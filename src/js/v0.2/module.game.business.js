define([
    'd3'
], function(d3) {
    'use strict';

    var api;
    var graphics;
    var lines = [];
    /**
     * line = {start, finish, id}
     */

    function getLineId(startCircle, finCircle) {
        var d3Start = d3.select(startCircle);
        var d3Finish = d3.select(finCircle);
        return 'line_' +
            d3Start.attr('cx') + '_' +
            d3Start.attr('cy') + '_' +
            d3Finish.attr('cx') + '_' +
            d3Finish.attr('cy');
    }

    function getCirclePosition(circle) {
        var d3js = d3.select(circle);
        return {
            x: d3js.attr('cx'),
            y: d3js.attr('cy')
        }
    }

    function isLineExist(startCircle, finCircle) {
        var id = getLineId(startCircle, finCircle);
        return lines.some(function(line) {
            return line.id === id;
        });
    }

    function getNotExistingPath(path) {
        var result = [];
        path.forEach(function(item) {
            if (!isLineExist(item.start, item.finish)) {
                result.push(item);
            }
        });
        return result;
    }

    function hoverIn(circle) {
        graphics.hoverIn(circle);
    }

    function hoverOut(circle) {
        graphics.hoverOut(circle);
    }

    function renderWall(path) {
        var pathForRender = getNotExistingPath(path);
        if (pathForRender.length) {
            lines = lines.concat(pathForRender.map(function(item) {
                item.id = getLineId(item.start, item.finish);
                return item;
            }));
            graphics.renderPath(pathForRender);
        }
    }

    api = {
        init: function(graphics_) {
            graphics = graphics_;
            return api;
        },
        hoverIn   : hoverIn,
        hoverOut  : hoverOut,
        renderWall: renderWall
    };
    return api;
});