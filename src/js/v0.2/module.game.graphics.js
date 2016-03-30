define([
    'd3'
], function (d3) {
    'use strict';

    var api;
    var gamePane;
    var business;

    var tableGroup;
    var pathsGroup;
    var dotsGroup;

    var groups;

    var xNum;
    var yNum;

    var STEP = 20;
    var OFFSET = 20;
    var STROKE_WIDTH = 3;
    
    var SELECTION_CIRCLE_RADIUS = 6;
    var SELECTION_CIRCLE_D_TYPE = 'SELECTION_D_TYPE';
    
    var MAIN_CIRCLE_RADIUS = 2;
    var MAIN_CIRCLE_D_TYPE = 'MAIN_CIRCLE_D_TYPE';
    
    var TABLE_STROKE_WIDTH = 1;
    var TABLE_STROKE_COLOR = '#AAEEFF';

    var scales = {
        linearDown: d3.scale.linear().domain([0, 2]).range([0, 2]),
        linearUp: d3.scale.linear().domain([0, 2]).range([0, 4])
    };

    function renderPath(path) {
        path.forEach(function (item) {
            var d3Start = d3.select(item.start);
            var d3Finish = d3.select(item.finish);
            pathsGroup.append("line").attr("x1", d3Start.attr('cx')).attr('y1', d3Start.attr('cy')).attr("x2", d3Finish.attr('cx')).attr("y2", d3Finish.attr('cy')).attr("stroke", "gray").attr("stroke-width", STROKE_WIDTH);
        });
    }
    
    function prepareCirclesData_(data) {
        var result = [];
        if (Array.isArray(data) && data.length) {
            data.forEach(function(dataItem) {
                var selectionCircle = {};
                var mainCircle = {};
                $.extend(true, selectionCircle, dataItem, {
                    x_: dataItem.xInd * STEP + OFFSET,
                    y_: dataItem.yInd * STEP + OFFSET,
                    r_: SELECTION_CIRCLE_RADIUS,
                    dType_: SELECTION_CIRCLE_D_TYPE,
                    fill_: '',
                    fillOpacity_: 0,
                    id_: dataItem.id + '_selection'
                });
                $.extend(true, mainCircle, dataItem, {
                    x_: dataItem.xInd * STEP + OFFSET,
                    y_: dataItem.yInd * STEP + OFFSET,
                    r_: MAIN_CIRCLE_RADIUS,
                    dType_: MAIN_CIRCLE_D_TYPE,
                    fill_: TABLE_STROKE_COLOR,
                    fillOpacity_: 1,
                    id_: dataItem.id
                });
                result.push(selectionCircle, mainCircle);
            });
        }
        return result;
    }
    
    function prepareCirclesData(data) {
        return data.map(function(dataItem) {
            var circle = {};
            $.extend(true, circle, dataItem, {
                x_: dataItem.xInd * STEP + OFFSET,
                y_: dataItem.yInd * STEP + OFFSET
            });
            return circle;
        });
    }

    function renderCircle() {

    }

    function renderCircles(data) {
        var mouseHoverElements = dotsGroup.selectAll('g')
            .data(data)
            .enter()
            .append('g');
        //Main circle
        mouseHoverElements.append('circle')
            .attr('r', MAIN_CIRCLE_RADIUS)
            .attr('cx', function (data) {return data.x_;})
            .attr('cy', function (data) {return data.y_;})
            .attr('id', function (data) {return data.id;})
            .attr('d_type', MAIN_CIRCLE_D_TYPE)
            .attr('fill', TABLE_STROKE_COLOR)
            .attr('fill-opacity', 1)
            .attr('data-id', function(data) {return data.id});
        //Selection circle
        mouseHoverElements.append('circle')
            .attr('r', SELECTION_CIRCLE_RADIUS)
            .attr('cx', function (data) {return data.x_;})
            .attr('cy', function (data) {return data.y_;})
            .attr('id', function (data) {return data.id + '_selection';})
            .attr('d_type', SELECTION_CIRCLE_D_TYPE)
            .attr('fill', '')
            .attr('fill-opacity', 0)
            .attr('data-id', function(data) {return data.id});
        return mouseHoverElements;
    }
    
    function getElementsForMouseEvents(elements) {
        return elements;
        //return dotsGroup.selectAll('circle[d_type=' + SELECTION_CIRCLE_D_TYPE + ']');        
    }

    function hoverIn(circle) {
        d3.select(circle).select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']').attr('r', function (data) {
            return scales.linearUp(data.radius);
        });
    }

    function hoverOut(circle) {
        d3.select(circle).select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']').attr('r', function (data) {
            return scales.linearDown(data.radius);
        });
    }
    
    function initEvents(elements) {
        var selectedCircle;
        var wallPath = [];

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

        elements.on('mouseenter', function () {
            //TODO needs to refactor
            console.log(this.id);
            if (selectedCircle && this !== selectedCircle && wallPath.indexOf(this) < 0) {
                wallPath.push(this);
            }
            business.hoverIn(this);
        }).on('mouseleave', function () {
            business.hoverOut(this);
        }).on('mousedown', function () {
            selectedCircle = this;
            wallPath = [selectedCircle];
        }).on('mouseup', function () {
            selectedCircle = null;
            wallPath = [];
        }).on('mousemove', function () {
            if (selectedCircle && this !== selectedCircle) {
                business.renderWall(convertWallPath(wallPath));
            }
        })
    }

    function createTableData() {
        var result = [];
        var x = 0;
        var y = 0;
        var height = STEP * (yNum - 1);
        var width = STEP * (xNum - 1);
        for (; x < xNum; x++) {
            //vertical line
            result.push({
                x1: x * STEP + OFFSET,
                y1: OFFSET / 2,
                x2: x * STEP + OFFSET,
                y2: OFFSET * 1.5 + height
            });
        }
        for (; y < yNum; y++) {
            //horizontal line
            result.push({
                x1: OFFSET / 2,
                y1: y * STEP + OFFSET,
                x2: OFFSET * 1.5 + width,
                y2: y * STEP + OFFSET
            });
        }
        return result;
    }

    function renderTable() {
        tableGroup.selectAll('line').data(createTableData()).enter()
            .append('line')
            .attr('x1', function(data) {return data.x1})
            .attr('y1', function(data) {return data.y1})
            .attr('x2', function(data) {return data.x2})
            .attr('y2', function(data) {return data.y2})
            .attr('stroke', TABLE_STROKE_COLOR)
            .attr('stroke-width', TABLE_STROKE_WIDTH);
    }

    api = {
        init: function (gamePane_, data, xNum_, yNum_) {
            var elements;
            xNum = xNum_;
            yNum = yNum_;
            gamePane = gamePane_;
            tableGroup = gamePane.append('g');
            pathsGroup = gamePane.append('g');
            dotsGroup = gamePane.append('g');
            elements = api.renderCircles(prepareCirclesData(data));
            initEvents(getElementsForMouseEvents(elements));
            renderTable();
            return api;
        },
        setBusiness: function (module) {
            business = module;
            return api;
        },
        hoverIn: hoverIn,
        hoverOut: hoverOut,
        renderPath: renderPath,
        renderCircle: renderCircle,
        renderCircles: renderCircles
    };
    return api;
});