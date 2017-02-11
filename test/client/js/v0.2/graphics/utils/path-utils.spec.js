define([
    'lodash',
    'graphics/utils/path-utils',
    './test-data/base4Vertex-5-testData',
    './test-data/base4Vertex-4-testData',
    './test-data/baseNVertex-7-testData',
    './test-data/baseNVertex-7.1-testData',
    'array-helper'
], function (_, PathUtils,
             Base4Vertex5TestData, Base4Vertex4TestData, BaseNVertex7TestData, BaseNVertex7_1TestData,
             arrayHelpers) {
    'use strict';

    describe('path-utils', function () {

        beforeEach(function () {
            arrayHelpers.init();
        });

        _.forEach(Base4Vertex4TestData.input, function (inboundTestData, index) {
            xit('should create valid path for Base 4 Vertex 4, rev' + index, function () {
                var path = PathUtils.getUnSortedPath(inboundTestData);

                expect(path).toEqualPath(Base4Vertex4TestData.output);
            });
        });

        _.forEach(Base4Vertex5TestData.input, function (inboundTestData, index) {
            xit('should create valid path for Base 4 Vertex 5 , rev' + index, function () {
                var path = PathUtils.getUnSortedPath(inboundTestData);

                expect(path).toEqualPath(Base4Vertex5TestData.output);
            });
        });

        _.forEach(BaseNVertex7TestData.input, function (inboundTestData, index) {
            it('should create valid path for Base N Vertex 7 , rev' + index, function () {
                var path = PathUtils.getUnSortedPath(inboundTestData);

                expect(path).toEqualPath(BaseNVertex7TestData.output);
            });
        });

        _.forEach(BaseNVertex7_1TestData.input, function (inboundTestData, index) {
            it('should create valid path for Base N Vertex 7.1 , rev' + index, function () {
                var path = PathUtils.getUnSortedPath(inboundTestData);

                expect(path).toEqualPath(BaseNVertex7_1TestData.output);
            });
        });
    });
});
