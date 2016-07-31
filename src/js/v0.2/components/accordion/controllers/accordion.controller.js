define([
    'angular',
    '../accordion.module'
], function(angular) {
    'use strict';

    angular.module('accordion.module').controller('accordionCtrl', accordionCtrl);

    function accordionCtrl($rootScope, $scope) {
        var vm = this;
    }
});