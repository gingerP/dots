define([
    'd3',
    'jquery',
    'lodash',
    'module.observable',
    'common/events',
    'business/game.storage',
    'graphics/utils/graphics-utils'
], function (d3, $, _, Observable, Events, GameStorage, GraphicsUtils) {
    'use strict';

    var api;
    var gamePane;
    var Business;
    var observable = Observable.instance;

    var circles;

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

    var DOT_RADIUS = 2;
    var DOT_RADIUS_SELECTED = 3;
    var DOT_RADIUS_HOVER_IN = 4;
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

    var dotSize = {
        selected: function() {
            return DOT_RADIUS_SELECTED;
        },
        unSelected: function() {
            return DOT_RADIUS;
        },
        hoverIn: function() {
            return DOT_RADIUS_HOVER_IN
        },
        hoverOut: function(data) {
            return data.isSelected ? DOT_RADIUS_SELECTED : DOT_RADIUS;
        }
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
                    r_: DOT_RADIUS,
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

    function renderCircle() {

    }

    function renderCircles(data) {
        var mouseHoverElements = dotsGroup.selectAll('g')
            .data(data)
            .enter()
            .append('g');
        //Main circle
        mouseHoverElements.append('circle')
            .attr('r', DOT_RADIUS)
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

    function hoverInDot(circle) {
        d3.select(circle)
            .select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']')
            .attr('r', dotSize.hoverIn);
    }

    function hoverOutDot(circle) {
        d3.select(circle)
            .select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']')
            .attr('r', dotSize.hoverOut);
    }

    function selectDots(selector, color) {
        circles.select(selector)
            .attr('r', function (data) {
                data.isSelected = true;
                return dotSize.selected();
            })
            .attr('fill', color);
    }

    function unSelectDots() {
        circles.select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']')
            .attr('r', function (data) {
                data.isSelected = false;
                return dotSize.unSelected();
            })
            .attr('fill', TABLE_STROKE_COLOR);
    }

    function selectDot(circle, color) {
        d3.select(circle)
            .select('circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']')
            .attr('r', function(data) {
                data.isSelected = true;
                return dotSize.selected();
            })
            .attr('fill', color);
    }

    function getDotByPosition(position) {
        var opponent = game
        var selector = GraphicsUtils.generateSelectorStringFromDots(position);
        var color
        selectDot(selector);
    }

    //function

    //Wall

    function renderWall(path_) {
        var path = GraphicsUtils.convertWallPath(path_);
        var pathForRender = GraphicsUtils.getNotExistingPath(path);
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

    function getCirclePosition(circle) {
        var d3js = d3.select(circle);
        return {
            x: d3js.attr('cx'),
            y: d3js.attr('cy')
        };
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
            hoverInDot(this);
//            }
        }).on('mouseleave', function (data) {
            //if (business.canSelectDot(data)) {
            hoverOutDot(this);
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
            if (Business.canSelectDot(data)) {
                Business.select(data).then(function (callback) {
                    selectDot(circle, Business.getActivePlayerColor());
                    callback();
                });
            }
        });
    }

    function renderTable() {
        var gridData = GraphicsUtils.createPaneGridData(xNum, yNum, STEP, OFFSET);
        tableGroup.selectAll('line').data(gridData).enter()
            .append('line')
            .attr('x1', getter('x1'))
            .attr('y1', getter('y1'))
            .attr('x2', getter('x2'))
            .attr('y2', getter('y2'))
            .attr('stroke', TABLE_STROKE_COLOR)
            .attr('stroke-width', TABLE_STROKE_WIDTH);
    }

    function renderDots(color, dots) {
        var preparedDots = _.isArray(dots) ? dots : [dots];
        var prefix = 'circle[d_type=' + MAIN_CIRCLE_D_TYPE + ']';
        var selector = GraphicsUtils.generateSelectorStringFromDots(preparedDots, prefix);
        selectDots(selector, color);
    }

    function renderLoops(/*color, loops*/) {

    }

    function renderTrappedDots(/*color, dots*/) {

    }

    function clearPane() {
        unSelectDots();
    }

    function init(gamePaneSelector, BusinessModule, xNum_, yNum_, data) {
        xNum = xNum_;
        yNum = yNum_;
        Business = BusinessModule;
        gamePane = d3.select(gamePaneSelector);
        tableGroup = gamePane.append('g');
        pathsGroup = gamePane.append('g');
        dotsGroup = gamePane.append('g');
        circles = api.renderCircles(GraphicsUtils.prepareCirclesData(data, STEP, OFFSET));
        initEvents(getElementsForMouseEvents(circles));
        renderTable();
        return api;
    }

    function renderPlayerState(player, dots, loops, trappedDots) {
        if (player) {
            if (dots && dots.length) {
                renderDots(player.color, dots);
            }
            if (loops && loops.length) {
                renderLoops(player.color, dots);
            }
            if (trappedDots && trappedDots.length) {
                renderTrappedDots(player.color, trappedDots);
            }
        }
    }

    api = {
        init: init,
        renderPlayerState: renderPlayerState,
        renderWall: renderWall,
        renderLoop: renderLoop,
        renderCircle: renderCircle,
        renderCircles: renderCircles,
        clearPane: clearPane
    };
    return api;
});
