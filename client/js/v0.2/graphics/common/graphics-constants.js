define([
    'utils/common-utils'
], function (CommonUtils) {
    'use strict';

    return {
        ANIMATION: {
            PULSATION: {
                ID: 'DOT-PULSATION-ANIMATION',
                MAX_RADIUS: 6,
                MIN_STROKE_WIDTH: 0,
                STROKE_WIDTH: 3,
                DURATION: 500
            }
        },
        GAME_PANE: {
            TABLE: {
                STEP: CommonUtils.isMobile() ? 25 : 20,
                OFFSET: 20,
                STROKE: {
                    WIDTH: 1,
                    COLOR: '#AAEEFF'
                }
            },
            DOT: {
                ID: 'MAIN_CIRCLE_D_TYPE',
                RADIUS: 2,
                RADIUS_SELECTED: 3,
                RADIUS_HOVER_IN: 4
            },
            DOT_SELECTION: {
                ID: 'SELECTION_D_TYPE',
                RADIUS: CommonUtils.isMobile() ? 12 : 10
            },
            PATH: {
                WIDTH: 2
            }
        }
    };
});
