define([
    'd3',
    'graphics/common/graphics-constants',
    'graphics/utils/common-graphics-utils'
], function (d3, GraphicsConstants, CommonGraphicsUtils) {
    'use strict';

    var api;
    var ANIMATION = GraphicsConstants.ANIMATION.PULSATION;
    var DOT = GraphicsConstants.GAME_PANE.DOT;

    function addPulsateAnimation(dotGroup, dot) {
        var position = CommonGraphicsUtils.getVertexPosition(dot);
        var circle;

        function repeat() {
            circle = circle || dotGroup.select('id', '#' + ANIMATION.ID);
            circle.transition()
                .attr('stroke-width', ANIMATION.MIN_STROKE_WIDTH)
                .attr('r', ANIMATION.MAX_RADIUS)
                .duration(ANIMATION.DURATION)
                .ease()
                .each('end', function () {
                    d3.select(this).attr('r', DOT.RADIUS).attr('stroke-width', ANIMATION.STROKE_WIDTH);
                    repeat();
                });
        }

        dotGroup.append('circle')
            .attr('id', ANIMATION.ID)
            .attr('stroke-width', ANIMATION.STROKE_WIDTH)
            .attr('r', DOT.RADIUS)
            .attr('cx', position.x)
            .attr('cy', position.y)
            .each(repeat);

    }

    function clearAnimation() {

    }

    api = {
        addPulsateAnimation: addPulsateAnimation,
        clearAnimation: clearAnimation
    };
    return api;
});
