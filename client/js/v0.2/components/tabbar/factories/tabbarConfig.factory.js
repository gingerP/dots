define([
    'angular',
    'components/tabbar/tabbar.module'
], function (angular) {
    'use strict';

    angular.module('tabbar.module').factory('tabbarConfig', tabbarConfig);

    function tabbarConfig() {

        return {
            TAB: {
                OPEN: 'OPEN',
                CLOSE: 'CLOSE'
            }
        };
    }
});
