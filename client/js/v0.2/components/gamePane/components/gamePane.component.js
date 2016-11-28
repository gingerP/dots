define([
    'angular',
    'module.observable',
    'graphics/module.game.graphics',
    'common/events',
    'components/gamePane/gamePane.module',
    'components/gamePane/controllers/gamePane.controller'
], function (angular, Observable, graphics, events) {
    'use strict';

    angular.module('gamePane.module').directive('gamePane', gamePaneDirective);

    function gamePaneDirective() {
        var observable = Observable.instance;

        function link() {
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
