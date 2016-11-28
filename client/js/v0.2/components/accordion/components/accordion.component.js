define([
    'angular',
    '../accordion.module',
    '../controllers/accordion.controller',
    '../../clientsList/components/clientsList.component'
], function(angular) {
    'use strict';

    angular.module('accordion.module').component('accordion', {
        bindings: {},
        controller: 'accordionCtrl',
        controllerAs: 'accordionCtrl',
        templateUrl: '/static/js/v0.2/components/accordion/partials/accordion.template.html'
    });
});
