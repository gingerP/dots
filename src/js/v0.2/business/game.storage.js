define([

], function() {
    'use strict';

    var api;
    var modes = {
        local: 'local',
        network: 'network'
    };

    api = {
        opponent: null,
        activePlayer: null,
        clients: [],
        mode: modes.local,
        modes: modes
    };
    return api;
});