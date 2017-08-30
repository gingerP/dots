'use strict';

const chai = require('chai');
const expect = chai.expect;
const VertexUtils = require('../../../../../server/libs/graph/utils/vertex-utils');
const Directions = require('../../../../../server/libs/graph/utils/directions');
const TEST_DATE_VERTEX = {x: 2, y: 3};
const TEST_DATA = [
    [
        '2 Holes',
        //TEST_DATE_2_HOLES
        [{x: 1, y: 1}, {x: 3, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 1, y: 4}, {
            x: 3,
            y: 4
        }],
        //TEST_DATE_2_HOLES_RESULT
        [[{x: 2, y: 2}], [{x: 2, y: 4}]]
        /*
         ┼─┼─┼─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─■─×─■─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─*/
    ],
    [
        '4 Holes',
        //TEST_DATA_4_HOLES
        [{x: 1, y: 1}, {x: 3, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 1, y: 4}, {x: 3, y: 4}],
        //TEST_DATE_4_HOLES_RESULT
        [[{x: 2, y: 2}], [{x: 3, y: 3}], [{x: 2, y: 4}], [{x: 1, y: 3}]]
        /*
         ┼─┼─┼─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─×─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─*/
    ],
    [
        '5 Holes',
        //TEST_DATA_5_HOLES
        [{x: 1, y: 1}, {x: 3, y: 1}, {x: 1, y: 3}, {x: 1, y: 4}, {x: 3, y: 4}],
        //TEST_DATE_5_HOLES_RESULT
        [[{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}], [{x: 2, y: 4}]]
        /*
         ┼─┼─┼─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─
         ┼─■─×─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─*/
    ],
    [
        '6 Holes',
        //TEST_DATA_6_HOLES
        [{x: 1, y: 1}, {x: 3, y: 1}, {x: 1, y: 3}, {x: 3, y: 4}],
        //TEST_DATE_6_HOLES_RESULT
        [[{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}], [{x: 2, y: 4}, {x: 1, y: 4}]]
        /*
         ┼─┼─┼─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─
         ┼─■─×─┼─┼─┼─
         ┼─┼─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─*/
    ],
    [
        '8 Holes',
        //TEST_DATA_8_HOLES
        [{x: 1, y: 1}, {x: 3, y: 1}],
        //TEST_DATE_8_HOLES_RESULT
        [[{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3},{x: 3,y: 4}, {x: 2, y: 4}, {x: 1, y: 4}, {x: 1, y: 3}]]
        /*
         ┼─┼─┼─┼─┼─┼─
         ┼─■─┼─■─┼─┼─
         ┼─┼─┼─┼─┼─┼─
         ┼─┼─×─┼─┼─┼─
         ┼─┼─┼─┼─┼─┼─
         ┼─┼─┼─┼─┼─┼─*/
    ]
];

describe('Vertex-utils', function () {
    describe('getHolesFromNeighborsAsGroups', () => {
        TEST_DATA.forEach((DATA) => {
            it(`should be ${DATA[0]}`, () => {
                const result = VertexUtils.getHolesFromNeighborsAsGroups(TEST_DATE_VERTEX, DATA[1]);
                expect(result).to.deep.equal(DATA[2]);
            });
        });
    });
});
