define([
    'd3',
    'graphics/common/graphics-constants',
    'graphics/utils/common-graphics-utils'
], function (d3, GraphicsConstants, CommonGraphicsUtils) {
    'use strict';

    var api;
    var ANIMATION = GraphicsConstants.ANIMATION.PULSATION;

    function addPulsateAnimation(dotGroup, color, dot) {
        var position = CommonGraphicsUtils.getVertexPosition(dot);
        var circle;
        var stopped = false;
        function repeat() {
            if (stopped) {
                return;
            }
            circle = circle || dotGroup.select('[id=' + ANIMATION.ID + ']');
            circle.transition()
                .attr('stroke-width', ANIMATION.MIN_STROKE_WIDTH)
                .attr('r', ANIMATION.MAX_RADIUS)
                .delay(ANIMATION.DELAY)
                .duration(ANIMATION.DURATION)
                .ease(d3.easeCubic)
                .on('end', function () {
                    circle.attr('r', ANIMATION.MIN_RADIUS).attr('stroke-width', ANIMATION.STROKE_WIDTH);
                    repeat();
                });
        }

        dotGroup
            .data([{}])
            .insert('circle', ':first-child')
            .attr('id', ANIMATION.ID)
            .attr('stroke-width', ANIMATION.STROKE_WIDTH)
            .attr('r', ANIMATION.MIN_RADIUS)
            .attr('cx', position.x)
            .attr('cy', position.y)
            .attr('stroke', color)
            .style('fill', 'none')
            .each(repeat);

        return function () {
            stopped = true;
            circle.transition()
                .attr('stroke-width', ANIMATION.MIN_STROKE_WIDTH)
                .attr('r', ANIMATION.MIN_RADIUS)
                .delay(ANIMATION.DELAY)
                .duration(ANIMATION.DURATION)
                .ease(d3.easeCubic)
                .on('end', function () {
                    circle.remove();
                });
        };
    }

    api = {
        addPulsateAnimation: addPulsateAnimation
    };
    return api;
});
