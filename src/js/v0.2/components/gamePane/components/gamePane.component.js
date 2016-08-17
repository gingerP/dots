define([
    'angular',
    'd3',
    'module.game.business',
    'module.game.graphics',
    'module.game.player',
    'module.game.player.history',
    'components/gamePane/gamePane.module',
    'components/gamePane/controllers/gamePane.controller'
], function (angular, d3, business, graphics, Player, History) {
    'use strict';

    angular.module('gamePane.module').directive('gamePane', gamePaneDirective);

    function gamePaneDirective() {

        function link(scope, elem, attr) {

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