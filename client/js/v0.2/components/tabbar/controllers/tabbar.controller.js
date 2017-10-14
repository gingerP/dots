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

        function setHeaderVisibility(isVisible) {
            if (CommonUtils.isMobile()) {
                vm.isHeadersVisible = isVisible;
            }
        }

        function openTab(tabId) {
            var isChanged = false;

            setHeaderVisibility(false);
            _.forEach(vm.context.list, function (tab) {
                if (!tab.isActive && tabId === tab.id) {
                    isChanged = true;
                }
                tab.isActive = tab.id === tabId;
            });

            if (isChanged) {
                $rootScope.$emit(Events.OPEN_TAB, tabId);
            }
        }

        function back() {
            setHeaderVisibility(true);
            _.forEach(vm.context.list, function (tab) {
                tab.isActive = false;
            });
        }

        function postLink() {

        }

        function init() {
            setHeaderVisibility(true);

            if (CommonUtils.isMobile()) {
                _.forEach(vm.context.list, function (tab) {
                    tab.isActive = false;
                });
            }
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

        onDestroy($rootScope.$on(Events.OPEN_TAB, onOpenedTab));
    }
});
