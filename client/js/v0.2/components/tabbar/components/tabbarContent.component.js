define([
    'angular',
    'utils/common-utils',
    'components/tabbar/tabbar.module',
    'components/utils/scope.utils',
    'components/tabbar/factories/tabbarConfig.factory'
], function (angular, CommonUtils) {
    'use strict';

    angular.module('tabbar.module').component('tabbarContent', {
        bindings: {
            tabId: '<'
        },
        templateUrl: '/static/js/v0.2/components/tabbar/partials/tabbarContent.template.html',
        require: '^tabbar',
        transclude: true,
        controllerAs: 'tabbarContent',
        controller: function TabbarContentCtrl(
            $rootScope, $scope,
            scopeUtils,
            tabbarConfig) {
            var vm = this,
                tabbarCtrl = $scope.$parent.$parent.tabbarCtrl,
                destroyLater = scopeUtils.destroy($scope),
                EVENTS = tabbarConfig.TAB;

            function back() {
                tabbarCtrl.back();
            }

            vm.tab = tabbarCtrl.registr(vm.tabId);
            vm.back = back;
        }
    });
});
