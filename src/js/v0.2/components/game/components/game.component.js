define([
    'angular',
    'components/game/game.module',
    'components/game/controllers/game.controller',
    'components/clientsList/components/clientsList.component',
    'components/currentPlayer/components/currentPlayer.component',
    'components/playerScore/components/playerScore.component',
    'components/toolbar/components/toolbar.component',
    'components/accordion/components/accordion.component',
    'components/playerMenu/components/playerMenu.component'
], function(angular) {
    'use strict';

    angular.module('game.module').component('game', {
        templateUrl: '/static/js/v0.2/components/game/partials/game.template.html',
        controller: 'gameCtrl',
        controllerAs: 'gameCtrl'
    });
});