(function () {
    'use strict';

    var recLoops = require('./graph-loops-recursive');
    var floodLoops = require('./graph-loops-flood-fill');

    module.exports = {
        loops: floodLoops
    }
})();