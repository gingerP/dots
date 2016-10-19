'use strict';

var floodLoops = require('./graph-loops-flood-fill');

module.exports = {
    getLoops: floodLoops.getLoops.bind(floodLoops)
};
