define([
    'angular',
    'components/playerMenu/playerMenu.module'
], function (angular) {
    'use strict';

    angular.module('playerColor.module').factory('playerMenuConfig', playerMenuConfig);

    function playerMenuConfig() {
        var TABS = {
            GAMERS: 'gamers',
            SIGNIN: 'signin'
        };

        function getConfig() {
            return {
                tabbar: [
                    {
                        id: TABS.GAMERS,
                        name: 'Gamers',
                        isActive: true
                    },
                    {
                        id: TABS.SIGNIN,
                        name: 'Sign-in'
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

