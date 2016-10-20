define([
    'd3',
    'lodash',
    'common/events',
    'business/game.storage',
    'graphics/utils/graphics-utils',
    'graphics/utils/convert-utils',
    'utils/common-utils'
], function (d3, _, Events, GameStorage, GraphicsUtils, ConvertUtils, CommonUtils) {
    'use strict';

    var api;
    var gamePane;
    var Business;

    var circles;

    var tableGroup;
    var pathsGroup;
    var dotsGroup;

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

    var dotSize = {
        selected: function() {
            return DOT_RADIUS_SELECTED;
        },
        unSelected: function() {
            return DOT_RADIUS;
        },
        hoverIn: function() {
            return DOT_RADIUS_HOVER_IN;
        },
        hoverOut: function(data) {
            return data.isSelected ? DOT_RADIUS_SELECTED : DOT_RADIUS;
        }
    };

    function getter(key) {
        return function (data) {
            return data[key];
        };
    }

    function renderPath(path, color) { //eslint-disable-line
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
            .attr('id', function (circleData) {
                return circleData.id + '_selection';
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

    function renderLoop(/*loop*/) {
        //renderWall(loop.concat(loop[0]));
        return api;
    }

    function getCirclePosition(circle) { //eslint-disable-line
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
            if (selectedCircle && data !== selectedCircle && wallPath.indexOf(data) < 0 ) {
                wallPath.push(data);
            }
            //if (business.canSelectDot(data)) {
            hoverInDot(this);
//            }
        }).on('mouseleave', function () {
            //if (business.canSelectDot(data)) {
            hoverOutDot(this);
            //}
        }).on('mousedown', function (data) {
            selectedCircle = data;
            wallPath = [data];
        }).on('mouseup', function () {
            selectedCircle = null;
            wallPath = [];
        }).on('mousemove', function (data) {
            if (selectedCircle && data !== selectedCircle) {
                //renderWall(wallPath);
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

    function renderLoops(loops, color) {
        _.forEach(loops, function(loopLines) {
            var pathForRender = GraphicsUtils.getNotExistingPath(loopLines);
            if (pathForRender.length) {
                lines = lines.concat(pathForRender.map(function (item) {
                    item.id = GraphicsUtils.getLineId(item.start, item.finish);
                    return item;
                }));
                renderPath(pathForRender, color);
            }
        });
    }

    function renderTrappedDots(/*color, dots*/) {

    }

    function clearPane() {
        if (circles) {
            unSelectDots();
        }
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

    function updatePlayerState(player, dots, loops, trappedDots) {
        var preparedDots, preparedLoops, preparedTrappedDots;
        if (player) {
            preparedDots = CommonUtils.createArray(dots);
            preparedLoops = CommonUtils.createArray(loops);
            preparedTrappedDots = CommonUtils.createArray(trappedDots);
            if (preparedDots && preparedDots.length) {
                renderDots(player.color, preparedDots);
            }
            if (preparedLoops && preparedLoops.length) {
                renderLoops(player.color, ConvertUtils.convertLoopsLines(preparedLoops));
            }
            if (preparedTrappedDots && preparedTrappedDots.length) {
                renderTrappedDots(player.color, preparedTrappedDots);
            }
        }
    }

    api = {
        init: init,
        updatePlayerState: updatePlayerState,
        renderLoop: renderLoop,
        renderCircles: renderCircles,
        clearPane: clearPane
    };
    return api;
});
