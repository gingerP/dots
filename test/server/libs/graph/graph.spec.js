'use strict';
const chai = require('chai');
const expect = chai.expect;
const Graph = require('../../../../server/libs/graph/graph');
const LoopsHelpers = require('./helpers/loop-helper');
const TEST_DATA = [
    [
        'only 1 loop',
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 0, y: 2}, {x: 3, y: 2},
            {x: 0, y: 3}, {x: 3, y: 3}, {x: 1, y: 4}, {x: 2, y: 4}],
        {x: 1, y: 1},
        [
            [{x: 1, y: 1}, {x: 2, y: 1}, {x: 0, y: 2}, {x: 3, y: 2},
                {x: 0, y: 3}, {x: 3, y: 3}, {x: 1, y: 4}, {x: 2, y: 4}]
        ]
        /*
         ┼─┼─┼─┼─┼─
         ┼─×─■─┼─┼─
         ■─┼─┼─■─┼─
         ■─┼─┼─■─┼─
         ┼─■─■─┼─┼─*/
    ],
    [
        '1 loop with another dots',
        [{x: 2, y: 0}, {x: 0, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 3, y: 2},
            {x: 0, y: 3}, {x: 3, y: 3}, {x: 1, y: 4}, {x: 2, y: 4}],
        {x: 1, y: 2},
        [
            [{x: 2, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 0, y: 3}, {x: 3, y: 3}, {x: 1, y: 4}, {x: 2, y: 4}]
        ]
        /*
         ┼─┼─■─┼─┼─
         ■─┼─■─┼─┼─
         ┼─×─┼─■─┼─
         ■─┼─┼─■─┼─
         ┼─■─■─┼─┼─*/
    ],
    [
        '2 loops with another 3 loops',
        [{x: 3, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 4, y: 1}, {x: 5, y: 1}, {x: 0, y: 2},
            {x: 3, y: 2}, {x: 5, y: 2}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 4, y: 3}, {x: 6, y: 3},
            {x: 2, y: 4}, {x: 5, y: 4}, {x: 2, y: 5}, {x: 4, y: 5}, {x: 2, y: 6}, {x: 3, y: 6}],
        {x: 3, y: 3},
        [
            [{x: 1, y: 1}, {x: 2, y: 1}, {x: 0, y: 2}, {x: 3, y: 2}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 2, y: 4}],
            [{x: 3, y: 3}, {x: 4, y: 3}, {x: 2, y: 4}, {x: 5, y: 4},
                {x: 2, y: 5}, {x: 4, y: 5}, {x: 3, y: 6}]
        ]
        /*
         ┼─┼─┼─■─┼─┼─┼─
         ┼─■─■─┼─■─■─┼─
         ■─┼─┼─■─┼─■─┼─
         ┼─■─┼─×─■─┼─■─
         ┼─┼─■─┼─┼─■─┼─
         ┼─┼─■─┼─■─┼─┼─
         ┼─┼─■─■─┼─┼─┼─*/
    ],
    [
        '0 loops with another 4 loops',
        [{x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}, {x: 5, y: 1}, {x: 6, y: 1}, {x: 1, y: 2}, {x: 3, y: 2},
            {x: 6, y: 2}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3},
            {x: 1, y: 4}, {x: 3, y: 4}, {x: 6, y: 4}, {x: 1, y: 5}, {x: 3, y: 5}, {x: 6, y: 5}, {x: 2, y: 6},
            {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}],
        {x: 3, y: 3},
        []
        /*
         ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─
         ┼─┼─■─■─■─■─■─┼─┼─┼─
         ┼─■─┼─■─┼─┼─■─┼─┼─┼─
         ┼─■─■─×─■─■─■─┼─┼─┼─
         ┼─■─┼─■─┼─┼─■─┼─┼─┼─
         ┼─■─┼─■─┼─┼─■─┼─┼─┼─
         ┼─┼─■─■─■─■─┼─┼─┼─┼─
         ┼─┼─┼─┼─┼─┼─┼─┼*/
    ]
];

describe('Graph', function () {
    describe('Graph.getLoopsWithVertexInBorder', function () {
        TEST_DATA.forEach((data) => {
            it(`should be ${data[0]}`, () => {
                const result = Graph.getLoopsWithVertexInBorder(data[1], data[2]);
                const loops = result.map(loop => loop.loop);
                expect(LoopsHelpers.isUnsortedListOfArraysEqual(loops, data[3])).to.be.true;
            });
        });
    });
});
