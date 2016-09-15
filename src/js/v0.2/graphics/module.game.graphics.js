define([
    'd3',
    'jquery'
], function (d3, $) {
    'use strict';

    var api;
    var gamePane;
    var business;

    var tableGroup;
    var pathsGroup;
    var dotsGroup;

    var groups;
    var lines = [];

    var xNum;
    var yNum;

    var STEP = 20;
    var OFFSET = 20;
    var STROKE_WIDTH = 2;

    var SELECTION_CIRCLE_RADIUS = 6;
    var SELECTION_CIRCLE_D_TYPE = 'SELECTION_D_TYPE';

    var MAIN_CIRCLE_RADIUS = 2;
    var MAIN_CIRCLE_D_TYPE = 'MAIN_CIRCLE_D_TYPE';

    var TABLE_STROKE_WIDTH = 1;
    var TABLE_STROKE_COLOR = '#AAEEFF';

    function getter(key) {
        return function (data) {
            return data[key];
        }
    }

    var scales = {
        linearDown: d3.scale.linear().domain([0, 2]).range([0, 2]),
        linearUp: d3.scale.linear().domain([0, 2]).range([0, 4]),
        markPressed: d3.scale.linear().domain([0, 2]).range([0, 3])
    };

    function renderPath(path, color) {
        path.forEach(function (item) {
            pathsGroup.append('line')
                .attr('x1', item.start.x_)
                .attr('y1', item.start.y_)
                .attr('x2', item.finish.x_)
                .attr('y2', item.finish.y_)
                .attr('stroke', color)
                .attr('stroke-width', STROKE_WIDTH);
        });
    }

    function prepareCirclesData_(data) {
        var result = [];
        if (Array.isArray(data) && data.length) {
            data.forEach(function (dataItem) {
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
        return data.map(function (dataItem) {
            dataItem.x_ = dataItem.xInd * STEP + OFFSET;
            dataItem.y_ = dataItem.yInd * STEP + OFFSET;
            return dataItem;
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
            .attr('cx', getter('x_'))
            .attr('cy', getter('y_'))
            .attr('id', getter('id'))
            .attr('d_type', MAIN_CIRCLE_D_TYPE)
            .attr('fill', TABLE_STROKE_COLOR)
            .attr('fill-opacity', 1)
            .attr('data-id', getter('id'));
        //Selection circle
        mouseHoverElements.append('circle')
            .attr('r', SELECTION_CIRCLE_RADIUS)
            .attr('cx', getter('x_'))
            .attr('cy', getter('y_'))
            .attr('id', function (data) {
                return data.id + '_selection';
            })
            .attr('d_type', SELECTION_CIRCLE_D_TYPE)
            .attr('fill', '')
            .attr('fill-opacity', 0)
            .attr('data-id', getter('id'));

/*        tableGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", getter('x_'))
            .attr("y", function(data) {
                return data.y_ + 8;
            })
            .text(function (d) {
                return d.xInd + ", " + d.yInd;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "9px")
            .attr("fill", "black");*/


        return mouseHoverElements;
    }

    function getElementsForMouseEvents(elements) {
        return elements;
        //return dotsGroup.selectAll('circle[d_type=' + SELECTION_CIRCLE_D_TYPE + ']');        
    }

    //Dots

    function hoverInCircle(circle) {
        d3.select(circle).select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']').attr('r', function (data) {
            return scales.linearUp(data.radius);
        });
    }

    function hoverOutCircle(circle) {
        d3.select(circle).select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']').attr('r', function (data) {
            return scales.linearDown(data.radius);
        });
    }

    function markPressedCircle(circle, color) {
        d3.select(circle)
            .select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']')
            .attr('r', function (data) {
                //TODO dot size
                return scales.markPressed(data.radius);
            })
            .attr('fill', color);
    }

    //Wall

    function renderWall(path_) {
        var path = convertWallPath(path_);
        var pathForRender = getNotExistingPath(path);
        if (pathForRender.length) {
            lines = lines.concat(pathForRender.map(function (item) {
                item.id = getLineId(item.start, item.finish);
                return item;
            }));
            renderPath(pathForRender, business.getActivePlayerColor());
        }
    }

    function renderLoop(loop) {
        renderWall(loop.concat(loop[0]));
        return api;
    }

    function getLineId(startCircle, finCircle) {
        return 'line_' +
            startCircle.x_ + '_' +
            startCircle.y_ + '_' +
            finCircle.x_ + '_' +
            finCircle.y_;
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

    function getCirclePosition(circle) {
        var d3js = d3.select(circle);
        return {
            x: d3js.attr('cx'),
            y: d3js.attr('cy')
        }
    }

    function isLineExist(startCircle, finCircle) {
        var id = getLineId(startCircle, finCircle);
        return lines.some(function (line) {
            return line.id === id;
        });
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

    function initEvents(elements) {
        var selectedCircle;
        var wallPath = [];

        elements.on('mouseenter', function (data) {
            //TODO needs to refactor
            var last = wallPath[wallPath.length - 1];
            if (selectedCircle && data !== selectedCircle && wallPath.indexOf(data) < 0 && business.canConnectDots(data, last)) {
                wallPath.push(data);
            }
            //if (business.canSelectDot(data)) {
            hoverInCircle(this);
//            }
        }).on('mouseleave', function (data) {
            //if (business.canSelectDot(data)) {
            hoverOutCircle(this);
            //}
        }).on('mousedown', function (data) {
            selectedCircle = data;
            wallPath = [data];
        }).on('mouseup', function (data) {
            selectedCircle = null;
            wallPath = [];
        }).on('mousemove', function (data) {
            if (selectedCircle && data !== selectedCircle) {
                renderWall(wallPath);
            }
        }).on('click', function (data) {
            var circle = this;
            if (business.canSelectDot(data)) {
                business.select(data).then(function (callback) {
                    markPressedCircle(circle, business.getActivePlayerColor());
                    callback();
                });
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
            .attr('x1', getter('x1'))
            .attr('y1', getter('y1'))
            .attr('x2', getter('x2'))
            .attr('y2', getter('y2'))
            .attr('stroke', TABLE_STROKE_COLOR)
            .attr('stroke-width', TABLE_STROKE_WIDTH)
    }

    function setSize(width, height, radius) {

    }

    api = {
        init: function (gamePaneSelector, xNum_, yNum_, data) {
            var elements;
            xNum = xNum_;
            yNum = yNum_;
            gamePane = d3.select(gamePaneSelector);
            tableGroup = gamePane.append('g');
            pathsGroup = gamePane.append('g');
            dotsGroup = gamePane.append('g');
            elements = api.renderCircles(prepareCirclesData(data));
            initEvents(getElementsForMouseEvents(elements));
            renderTable();
            return api;
        },
        setSize: setSize,
        setBusiness: function (module) {
            business = module;
            return api;
        },
        renderWall: renderWall,
        renderLoop: renderLoop,
        renderCircle: renderCircle,
        renderCircles: renderCircles
    };
    return api;
});