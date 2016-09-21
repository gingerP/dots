define([
    'angular',
    'module.observable',
    'd3',
    'module.game.business',
    'module.game.graphics',
    'module.game.player',
    'module.game.player.history',
    'common/events',
    'components/gamePane/gamePane.module',
    'components/gamePane/controllers/gamePane.controller'
], function (angular, Observable, d3, business, graphics, Player, History, events) {
    'use strict';

    angular.module('gamePane.module').directive('gamePane', gamePaneDirective);

    function gamePaneDirective() {
        var observable = Observable.instance;

        function link(scope, elem, attr) {
            observable.emit(events.GAME_PANE_RENDER);
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