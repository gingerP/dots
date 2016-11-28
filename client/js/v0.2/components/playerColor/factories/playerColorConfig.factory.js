define([
    'angular',
    'components/playerColor/playerColor.module'
], function (angular) {
    'use strict';

    angular.module('playerColor.module').factory('playerColorConfigFactory', playerColorConfigFactory);

    function playerColorConfigFactory() {

        function getDefaultOptions() {
            return {
                enableEditor: false,
                defaultColor: '#FF0000'
            };
        }

        return {
            getDefaultOptions: getDefaultOptions
        };
    }
});

