'use strict';

const chai = require('chai');
const expect = chai.expect;
const LoopCheckerUtils = require('../../../../../server/libs/graph/utils/loop-checker-utils');
const TEST_DATE_VERTEX = {x: 2, y: 3};
const TEST_DATA = [
    [
        [{x: 2, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2},
			{x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 1, y: 4},
			{x: 2, y: 4}, {x: 3, y: 4}],
		{x: 2, y: 3},
        true
    ]
];

describe('loop-checker-utils', function () {
    describe('isVertexInsideLoop', () => {
        TEST_DATA.forEach((DATA) => {
            it(`should be ${DATA[2] ? 'in' : 'out'}side`, () => {
                const start = Date.now();
                const result = LoopCheckerUtils.isVertexInsideLoop(DATA[0], DATA[1]);
                expect(result).to.equal(DATA[2]);
            });
        });
    });
});
