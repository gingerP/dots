define([
    'graphics/utils/path-utils'
], function (PathUtils) {
    'use strict';

    var VERTEXES_4LOOP_VER01 = [
            {x: 100, y: 100},
            {x: 101, y: 99},
            {x: 102, y: 100},
            {x: 101, y: 101}
        ],
        VERTEXES_4LOOP_VER02 = [
            {x: 102, y: 100},
            {x: 100, y: 100},
            {x: 101, y: 99},
            {x: 101, y: 101}
        ],
        VERTEXES_4LOOP_VER03 = [
            {x: 100, y: 100},
            {x: 101, y: 99},
            {x: 102, y: 100},
            {x: 101, y: 101}
        ],
        VERTEXES_4LOOP_VER04 = [
            {x: 101, y: 99},
            {x: 102, y: 100},
            {x: 100, y: 100},
            {x: 101, y: 101}
        ],
        VERTEXES_4LOOP_RESULT = [
            {start: {x: 100, y: 100}, finish: {x: 101, y: 99}},
            {start: {x: 101, y: 99}, finish: {x: 102, y: 100}},
            {start: {x: 102, y: 100}, finish: {x: 101, y: 101}},
            {start: {x: 101, y: 101}, finish: {x: 100, y: 100}}
        ];

    describe('path-utils', function () {

        it('4 vertex loop', function () {
            var path = PathUtils.getUnSortedPath(VERTEXES_4LOOP_VER01);

            expect(path).toEqual(VERTEXES_4LOOP_RESULT);

           /* path = PathUtils.getUnSortedPath(VERTEXES_4LOOP_VER02);

            expect(path).toEqual(VERTEXES_4LOOP_RESULT);

            path = PathUtils.getUnSortedPath(VERTEXES_4LOOP_VER03);

            expect(path).toEqual(VERTEXES_4LOOP_RESULT);

            path = PathUtils.getUnSortedPath(VERTEXES_4LOOP_VER04);

            expect(path).toEqual(VERTEXES_4LOOP_RESULT);*/

        });
    });
});
