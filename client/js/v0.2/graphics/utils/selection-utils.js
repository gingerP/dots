define([
    'd3',
    'graphics/utils/common-graphics-utils'
], function (d3, CommonGraphicsUtils) {
    'use strict';

    function selectDotGroup(dotXY, d3Selection) {
        var dotId = CommonGraphicsUtils.getDotId(dotXY);
        var node = d3Selection.select('#' + dotId).node();
        return d3.select(node.parentNode);
    }

    return {
        selectDotGroup: selectDotGroup
    };
});
