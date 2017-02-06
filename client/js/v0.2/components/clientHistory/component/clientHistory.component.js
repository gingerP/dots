define([
    'angular',
    'lodash',
    'module.observable',
    'graphics/module.game.graphics',
    'common/events',
    'common/services/game-data.service',
    'common/common-constants',
    'components/clientHistory/clientHistory.module'
], function (angular, _, Observable, graphics, Events, GameDataService, CommonConstants) {
    'use strict';

    angular.module('client.history.module').component('clientHistory', {
        bindings: {},
        controllerAs: 'clientHistoryCtrl',
        controller: function clientHistoryController($rootScope, $scope) {
            var RELOAD_TIMEOUT = 500;

            function applyHistory(history) {

            }

            function reload(event, tabId) {
                if (tabId === CommonConstants.TABS.CLIENT_HISTORY) {
                    GameDataService
                        .getCurrentClientHistory()
                        .then(applyHistory);
                }
            }

            $scope.$on('$destroy', $rootScope.$on(Events.OPEN_TAB, _.debounce(reload, RELOAD_TIMEOUT)));
        },
        templateUrl: '/static/js/v0.2/components/clientHistory/partials/clientHistory.template.html'
    });
});
