define([
    'angular',
    'module.observable',
    'graphics/module.game.graphics',
    'common/events',
    'client/js/v0.2/components/gamesHistory/gamesHistory.module'
], function (angular, Observable, graphics, events) {
    'use strict';

    angular.module('games.history.module').component('gamesHistory', gamesHistoryComponent());

    function gamesHistoryComponent() {
        return {
            bindings: {},
            controllerAs: 'gamesHistoryCtrl',
            controller: function gamesHistoryController() {

            },
            templateUrl: 'components/gamesHistory/partials/gamesHistory.template.html'
        };
    }
});
