define([
    'angular',
    'd3',
    'module.game.business',
    'module.game.graphics',
    'module.game.player',
    'module.game.player.history',
    'components/constants/events.constant',
    'components/gamePane/gamePane.module',
    'components/gamePane/controllers/gamePane.controller'
], function (angular, d3, business, graphics, Player, History, events) {
    'use strict';

    angular.module('gamePane.module').directive('gamePane', gamePaneDirective);

    function gamePaneDirective() {

        function link(scope, elem, attr) {
            scope.$root.$emit(events.GAME_PANE_RENDER);
        }

        return {
            scope: {},
            controller: 'gamePaneCtrl',
            controllerAs: 'gamePaneCtrl',
            bindToController: true,
            templateUrl: '/static/js/v0.2/components/gamePane/partials/gamePane.template.html',
            link: link
        };
    }
});