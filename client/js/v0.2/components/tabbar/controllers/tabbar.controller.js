define([
    'jquery',
    'angular',
    'lodash',
    'utils/common-utils',
    'common/events',
    'components/utils/scope.utils',
    'components/tabbar/tabbar.module'
], function ($, angular, _, CommonUtils, Events) {
    'use strict';

    angular.module('tabbar.module').controller('tabbarCtrl', TabbarController);

    function TabbarController($scope, $rootScope, $element, $transclude, scopeUtils) {
        var vm = this,
            onDestroy = scopeUtils.destroy($scope),
            apply = scopeUtils.getApply($scope);

        function onOpenedTab(event, tabId) {
            openTab(tabId);
        }

        function setHeaderVisibility(isVisible) {
            vm.isHeadersVisible = isVisible;
        }

        function openTab(tabId) {
            var isChanged = false;
            setHeaderVisibility(false);
            _.forEach(vm.context.list, function (tab) {
                if (!tab.isActive && tabId === tab.id) {
                    isChanged = true;
                    vm.hasSelected = true;
                }
                tab.isActive = tab.id === tabId;
            });

            if (isChanged) {
                $rootScope.$emit(Events.OPEN_TAB, tabId);
            }
        }

        function back() {
            vm.hasSelected = false;
            setHeaderVisibility(true);
            _.forEach(vm.context.list, function (tab) {
                tab.isActive = false;
            });
            apply();
        }

        function postLink() {

        }

        function init() {
            setHeaderVisibility(true);

            _.forEach(vm.context.list, function (tab) {
                tab.isActive = false;
            });
        }

        function registr(id) {
            return _.find(vm.context.list, {id: id});
        }

        function getHeaderClassName() {
            //var size = Math.floor(100 / vm.context.list.length);

            //return 'w' + size + 'p';
            return '';
        }

        vm.registr = registr;
        vm.openTab = function (tab) {
            openTab(tab.id);
        };
        vm.back = back;
        vm.$postLink = postLink;
        vm.$onInit = init;
        vm.isHeadersVisible = true;
        vm.tabbarHeaderClassName = getHeaderClassName();
        vm.hasSelected = false;

        onDestroy($rootScope.$on(Events.OPEN_TAB, onOpenedTab));
    }
});
