define([
    'angular',
    '../clientsList.module',
    '../controllers/clientsList.controller'
], function (angular) {
    'use strict';

    angular.module('clientsList.module').directive('clientsList', clientsList);

    function clientsList() {
        function linkFunction() {}

        return {
            scope: {},
            controller: 'clientsListCtrl',
            controllerAs: 'clientsListCtrl',
            templateUrl: '/static/js/v0.2/components/clientsList/partials/clientsList.template.html',
            link: linkFunction
        };
    }
});
