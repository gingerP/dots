'use strict';
var chai = require('chai');
var expect = chai.expect;
var DirectionUtils = req('server/libs/graph/utils/direction-utils');
var Directions = req('server/libs/graph/utils/directions');
var testVertexesForwardBorders = [
    [{isSelected: false}, {isSelected: false}, {isSelected: false}],
    [{isSelected: false}, {isSelected: false}, {isSelected: false}],
    [{isSelected: false}, {isSelected: false}, {isSelected: false}]
];
var testVertexesForwardCenter = [
    [{isSelected: true}, {isSelected: false}, {isSelected: false}],
    [{isSelected: true}, {isSelected: false}, {isSelected: false}],
    [{isSelected: true}, {isSelected: false}, {isSelected: false}]
];
var testVertexesBothWays = [
    [{isSelected: false}, {isSelected: false}, {isSelected: false}],
    [{isSelected: false}, {isSelected: false}, {isSelected: false}],
    [{isSelected: false}, {isSelected: false}, {isSelected: false}]
];
var testVertexesBacwardCenter = [
    [{isSelected: false}, {isSelected: false}, {isSelected: true}],
    [{isSelected: false}, {isSelected: false}, {isSelected: true}],
    [{isSelected: false}, {isSelected: false}, {isSelected: true}]
];

describe('Direction-utils', function () {
    it('should be direction FORWARD on border', function () {
        var direction = DirectionUtils.getDirection(0, 0, testVertexesForwardBorders);
        expect(direction).to.equal(Directions.FORWARD);

        direction = DirectionUtils.getDirection(1, 0, testVertexesForwardBorders);
        expect(direction).to.equal(Directions.FORWARD);

        direction = DirectionUtils.getDirection(2, 0, testVertexesForwardBorders);
        expect(direction).to.equal(Directions.FORWARD);
    });

    it('should be direction FORWARD on center', function () {
        var direction = DirectionUtils.getDirection(0, 1, testVertexesForwardCenter);
        expect(direction).to.equal(Directions.FORWARD);

        direction = DirectionUtils.getDirection(1, 1, testVertexesForwardCenter);
        expect(direction).to.equal(Directions.FORWARD);

        direction = DirectionUtils.getDirection(2, 1, testVertexesForwardCenter);
        expect(direction).to.equal(Directions.FORWARD);
    });

    it('should be direction BOTH_WAYS on center', function () {
        var direction = DirectionUtils.getDirection(0, 1, testVertexesBothWays);
        expect(direction).to.equal(Directions.BOTH_WAYS);

        direction = DirectionUtils.getDirection(1, 1, testVertexesBothWays);
        expect(direction).to.equal(Directions.BOTH_WAYS);

        direction = DirectionUtils.getDirection(2, 1, testVertexesBothWays);
        expect(direction).to.equal(Directions.BOTH_WAYS);
    });

    it('should be direction BACKWARD on center', function () {
        var direction = DirectionUtils.getDirection(0, 1, testVertexesBacwardCenter);
        expect(direction).to.equal(Directions.BACKWARD);

        direction = DirectionUtils.getDirection(1, 1, testVertexesBacwardCenter);
        expect(direction).to.equal(Directions.BACKWARD);

        direction = DirectionUtils.getDirection(2, 1, testVertexesBacwardCenter);
        expect(direction).to.equal(Directions.BACKWARD);
    });
});
