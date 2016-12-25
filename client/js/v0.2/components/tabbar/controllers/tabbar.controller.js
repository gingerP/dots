define([
    'angular',
    'lodash',
    'utils/common-utils',
    'components/tabbar/tabbar.module'
], function (angular, _, CommonUtils) {
    'use strict';

    angular.module('tabbar.module').controller('tabbarCtrl', TabbarController);

    function TabbarController($scope, $element, $transclude) {
        var vm = this;

        function openTab(newActiveTab) {
            vm.isHeadersVisible = false;
            _.forEach(vm.context.list, function (tab) {
                tab.isActive = tab.id === newActiveTab.id;
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
        vm.openTab = openTab;
        vm.back = back;
        vm.$postLink = postLink;
        vm.$onInit = init;
    }
});
