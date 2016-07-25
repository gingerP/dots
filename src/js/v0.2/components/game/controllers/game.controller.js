define([
    'angular',
    'module.backend.service',
    'components/game/game.module'
], function(angular, backend) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl() {
    }
});