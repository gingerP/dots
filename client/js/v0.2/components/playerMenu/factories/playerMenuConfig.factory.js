define([
    'angular',
    'utils/constants',
    'components/playerMenu/playerMenu.module'
], function (angular, Constants) {
    'use strict';

    angular.module('playerColor.module').factory('playerMenuConfig', playerMenuConfig);

    function playerMenuConfig() {
        var TABS = Constants.TABS;

        function getConfig() {
            return {
                list: [
                    {
                        id: TABS.GAMERS,
                        name: 'Gamers',
                        isActive: true,
                        isDefault: true,
                        icon: 'people'
                    },
                    {
                        id: TABS.ACTIVE_GAME,
                        name: 'Active Game',
                        isActive: false,
                        isDefault: false,
                        icon: 'games'
                    },
                    {
                        id: TABS.CLIENT_HISTORY,
                        name: 'My history',
                        isActive: false,
                        isDefault: false,
                        icon: 'history'
                    },
                    {
                        id: TABS.SIGNIN,
                        name: 'Sign-in',
                        isActive: false,
                        isDefault: false,
                        icon: 'login'
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

