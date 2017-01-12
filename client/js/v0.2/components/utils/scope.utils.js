define([
    'angular',
    'lodash',
    'components/utils/common.helpers.module'
], function (angular, _) {
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

        function destroy(scope) {
            return function () {
                _.forEach(arguments, function (toRemove) {
                    scope.$on('$destroy', toRemove);
                });
            };
        }

        return {
            apply: apply,
            getApply: getApply,
            destroy: destroy
        };
    }
});
