define([
    'angular',
    'common/common-constants',
    'components/playerMenu/playerMenu.module'
], function (angular, CommonConstants) {
    'use strict';

    angular.module('playerColor.module').factory('playerMenuConfig', playerMenuConfig);

    function playerMenuConfig() {
        var TABS = CommonConstants.TABS;

        function getConfig() {
            return {
                list: [
                    {
                        id: TABS.GAMERS,
                        name: 'Gamers',
                        isActive: true,
                        isDefault: true
                    },
                    {
                        id: TABS.SIGNIN,
                        name: 'Sign-in',
                        isActive: false,
                        isDefault: false
                    },
                    {
                        id: TABS.CLIENT_HISTORY,
                        name: 'My history',
                        isActive: false,
                        isDefault: false
                    }
                ]
            };
        }

        return {
            getConfig: getConfig,
            TABS: TABS
        };
    }
});

