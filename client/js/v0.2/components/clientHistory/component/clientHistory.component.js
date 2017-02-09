define([
    'angular',
    'lodash',
    'module.observable',
    'graphics/module.game.graphics',
    'common/events',
    'common/services/game-data.service',
    'common/common-constants',
    'components/clientHistory/clientHistory.module',
    'components/clientHistory/factories/client-history.factory',
    'components/utils/scope.utils'
], function (angular, _, Observable, graphics, Events, GameDataService, CommonConstants) {
    'use strict';

    angular.module('client.history.module').component('clientHistory', {
        bindings: {},
        controllerAs: 'clientHistoryCtrl',
        controller: function clientHistoryController($rootScope, $scope, scopeUtils, clientHistoryConfig) {
            var RELOAD_TIMEOUT = 500;
            var vm = this;
            var apply = scopeUtils.getApply($scope);

            function applyHistory(history) {
                vm.historyList = clientHistoryConfig.prepareHistoryForUi(history);
                apply();
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
