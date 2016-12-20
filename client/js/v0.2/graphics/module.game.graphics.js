define([
    'd3',
    'lodash',
    'common/events',
    'business/game.storage',
    'utils/common-utils',
    'graphics/utils/common-graphics-utils',
    'graphics/utils/convert-utils',
    'graphics/utils/path-utils',
    'graphics/utils/animation-utils',
    'graphics/utils/selection-utils',
    'graphics/common/graphics-constants'
], function (d3, _,
             Events,
             GameStorage,
             CommonUtils, CommonGraphicsUtils, ConvertUtils, PathUtils, AnimationUtils, SelectionUtils,
             GraphicsConstants) {
    'use strict';

    var api;
    var gamePane;
    var Business;

    var circles;

    var tableGroup;
    var pathsGroup;
    var dotsGroup;

    var lines = [];
    var animations = [];

    var xNum;
    var yNum;

    var GAME_PANE = GraphicsConstants.GAME_PANE;
    var TABLE = GAME_PANE.TABLE;
    var DOT = GAME_PANE.DOT;
    var SELECTION = GAME_PANE.DOT_SELECTION;
    var PATH = GAME_PANE.PATH;

    var dotSize = {
        selected: function () {
            return DOT.RADIUS_SELECTED;
        },
        unSelected: function () {
            return DOT.RADIUS;
        },
        hoverIn: function () {
            return DOT.RADIUS_HOVER_IN;
        },
        hoverOut: function (data) {
            return data.isSelected ? DOT.RADIUS_SELECTED : DOT.RADIUS;
        }
    };

    function clearAnimation() {
        _.forEach(animations, function (clear) {
            if (_.isFunction(clear)) {
                clear();
            }
        });
    }

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
                .attr('stroke-width', PATH.WIDTH);
        });
    }

    function renderCircles(data) {
        var mouseHoverElements = dotsGroup.selectAll('g')
            .data(data)
            .enter()
            .append('g');
        //Main circle
        mouseHoverElements.append('circle')
            .attr('r', DOT.RADIUS)
            .attr('cx', getter('x_'))
            .attr('cy', getter('y_'))
            .attr('id', getter('id'))
            .attr('d_type', DOT.ID)
            .attr('fill', TABLE.STROKE.COLOR)
            .attr('fill-opacity', 1)
            .attr('data-id', getter('id'));
        //Selection circle
        mouseHoverElements.append('circle')
            .attr('r', SELECTION.RADIUS)
            .attr('cx', getter('x_'))
            .attr('cy', getter('y_'))
            .attr('id', CommonGraphicsUtils.getSelectionDotId)
            .attr('d_type', SELECTION.ID)
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

    function getElementsForMouseEvents() {
        //return elements;
        return dotsGroup.selectAll('circle[d_type=' + SELECTION.ID + ']');
    }

    //Dots

    function hoverInDot(circle) {
        SelectionUtils.selectDotBySelectionDot(circle).attr('r', dotSize.hoverIn);
    }

    function hoverOutDot(circle) {
        SelectionUtils.selectDotBySelectionDot(circle).attr('r', dotSize.hoverOut);
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
        circles.select('circle[d_type=' + DOT.ID + ']')
            .attr('r', function (data) {
                data.isSelected = false;
                return dotSize.unSelected();
            })
            .attr('fill', TABLE.STROKE.COLOR);
    }

    function removeLoopsLins() {
        pathsGroup.selectAll('*').remove();
    }

    function selectDot(circle, color) {
        d3.select(circle)
            .select('circle[d_type=' + DOT.ID + ']')
            .attr('r', function (data) {
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
        /*var wallPath = [];*/

        elements.on('mouseenter', function () {
            //TODO needs to refactor
            /*            if (selectedCircle && data !== selectedCircle && wallPath.indexOf(data) < 0) {
             wallPath.push(data);
             }*/
            //if (business.canSelectDot(data)) {
            hoverInDot(this);
//            }
        }).on('mouseleave', function () {
            //if (business.canSelectDot(data)) {
            hoverOutDot(this);
            //}
        }).on('mousedown', function (data) {
            selectedCircle = data;
            /*wallPath = [data];*/
        }).on('mouseup', function () {
            selectedCircle = null;
            /*wallPath = [];*/
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
        var gridData = CommonGraphicsUtils.createPaneGridData(xNum, yNum, TABLE.STEP, TABLE.OFFSET);
        tableGroup.selectAll('line').data(gridData).enter()
            .append('line')
            .attr('x1', getter('x1'))
            .attr('y1', getter('y1'))
            .attr('x2', getter('x2'))
            .attr('y2', getter('y2'))
            .attr('stroke', TABLE.STROKE.COLOR)
            .attr('stroke-width', TABLE.STROKE.WIDTH);
    }

    function renderDots(dots, color) {
        var preparedDots = _.isArray(dots) ? dots : [dots];
        var prefix = 'circle[d_type=' + DOT.ID + ']';
        var selector = CommonGraphicsUtils.generateSelectorStringFromDots(preparedDots, prefix);
        selectDots(selector, color);
    }

    function renderLoops(loops, color) {
        _.forEach(loops, function (loopLines) {
            var pathForRender = CommonGraphicsUtils.getNotExistingPath(loopLines, lines);
            if (pathForRender.length) {
                lines = lines.concat(pathForRender.map(function (item) {
                    item.id = CommonGraphicsUtils.getLineId(item.start, item.finish);
                    return item;
                }));
                renderPath(pathForRender, color);
            }
        });
    }

    function renderTrappedDots(/*dots, color*/) {

    }

    function clearPane() {
        if (circles) {
            unSelectDots();
            removeLoopsLins();
        }
        return api;
    }

    function updatePanelSize() {
        var size = CommonGraphicsUtils.getPaneSize(xNum, yNum, TABLE.STEP, TABLE.OFFSET);
        gamePane.attr('width', size.width).attr('height', size.height);
    }

    function init(gamePaneSelector, BusinessModule, xNum_, yNum_, data) {
        xNum = xNum_;
        yNum = yNum_;
        Business = BusinessModule;
        gamePane = d3.select(gamePaneSelector);
        tableGroup = gamePane.append('g');
        pathsGroup = gamePane.append('g');
        dotsGroup = gamePane.append('g');
        circles = api.renderCircles(CommonGraphicsUtils.prepareCirclesData(data, TABLE.STEP, TABLE.OFFSET));
        initEvents(getElementsForMouseEvents(circles));
        renderTable();
        updatePanelSize();
        return api;
    }

    function updatePlayerState(color, dots, loops, trappedDots, losingDots, withAnimation) {
        var preparedDots,
            preparedLoops,
            preparedTrappedDots,
            lastDot,
            colorValue = CommonGraphicsUtils.getColorValue(color);

        preparedDots = CommonUtils.createArray(dots);
        preparedLoops = CommonUtils.createArray(loops);
        preparedTrappedDots = CommonUtils.createArray(trappedDots);
        lastDot = preparedDots.length ? preparedDots[preparedDots.length - 1] : null;

        if (preparedDots && preparedDots.length) {
            renderDots(preparedDots, colorValue);
        }
        if (preparedLoops && preparedLoops.length) {
            renderLoops(
                CommonGraphicsUtils.getFilteredAndConvertedLoops(preparedLoops, TABLE.STEP, TABLE.OFFSET),
                colorValue
            );
        }
        if (preparedTrappedDots && preparedTrappedDots.length) {
            renderTrappedDots(preparedTrappedDots, colorValue);
        }
        if (withAnimation && lastDot) {
            clearAnimation();
            animations.push(
                AnimationUtils.addPulsateAnimation(SelectionUtils.selectDotGroup(lastDot, circles), colorValue, lastDot)
            );
        }
        return api;
    }

    function updatePlayerStep(color, dot, loops, trappedDots, losingDots, withAnimation) {
        var colorValue = CommonGraphicsUtils.getColorValue(color);

        updatePlayerState(color, dot, loops, trappedDots, losingDots);

        if (withAnimation) {
            clearAnimation();
            animations.push(
                AnimationUtils.addPulsateAnimation(SelectionUtils.selectDotGroup(dot, circles), colorValue, dot)
            );
        }
    }

    api = {
        init: init,
        updatePlayerStep: updatePlayerStep,
        updatePlayerState: updatePlayerState,
        renderLoop: renderLoop,
        renderCircles: renderCircles,
        clearPane: clearPane,
        clearAnimation: clearAnimation
    };
    return api;
});
