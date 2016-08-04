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
            var pane = d3.select('#game-pane');
            var data = createData(40, 40, 2);
            var playerA = new Player().init('red', 'Red', '#df815a', 'red', new History());
            var playerB = new Player().init('blue', 'Blue', '#639bb4', 'blue', new History());
            business.init(business.modes.network, graphics, data, convertData(data)).addActivePlayers(playerA, playerB).makePlayerActive(playerA);
            graphics.init(pane, data, 40, 40).setBusiness(business);
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