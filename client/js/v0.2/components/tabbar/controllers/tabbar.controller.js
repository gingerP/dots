define([
    'angular',
    'lodash',
    'utils/common-utils',
    'common/events',
    'components/utils/scope.utils',
    'components/tabbar/tabbar.module'
], function (angular, _, CommonUtils, Events) {
    'use strict';

    angular.module('tabbar.module').controller('tabbarCtrl', TabbarController);

    function TabbarController($scope, $rootScope, $element, $transclude, scopeUtils) {
        var vm = this,
            onDestroy = scopeUtils.destroy($scope);

        function onOpenedTab(event, tabId) {
            openTab(tabId);
        }

        function openTab(tabId) {
            vm.isHeadersVisible = false;
            _.forEach(vm.context.list, function (tab) {
                tab.isActive = tab.id === tabId;
            });
        }

        function back() {
            vm.isHeadersVisible = true;
            _.forEach(vm.context.list, function (tab) {
                tab.isActive = false;
            });
        }

        function postLink() {

        }

        function init() {
            vm.isHeadersVisible = true;

            if (CommonUtils.isMobile()) {
                _.forEach(vm.context.list, function (tab) {
                    tab.isActive = false;
                });
            }
        }

        function registr(id) {
            return _.find(vm.context.list, {id: id});
        }

        vm.registr = registr;
        vm.openTab = function (tab) {
            openTab(tab.id);
        };
        vm.back = back;
        vm.$postLink = postLink;
        vm.$onInit = init;

        onDestroy($rootScope.$on(Events.OPEN_TAB, onOpenedTab));
    }
});
