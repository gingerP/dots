define([
    'angular',
    'components/utils/common.helpers.module'
], function (angular) {
    'use strict';

    angular.module('common.helpers.module').factory('scopeUtils', scopeUtils);

    function scopeUtils($rootScope) {

        function apply(scope) {
            if ($rootScope.$$phase !== '$apply' && $rootScope.$$phase !== '$digest') {
                scope.$apply();
            }
        }

        function getApply(scope) {
            return function () {
                apply(scope);
            };
        }

        return {
            apply: apply,
            getApply: getApply
        };
    }
});
