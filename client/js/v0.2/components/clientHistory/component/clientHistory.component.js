define([
    'angular',
    'module.observable',
    'graphics/module.game.graphics',
    'common/events',
    'components/clientHistory/clientHistory.module'
], function (angular, Observable, graphics, events) {
    'use strict';

    angular.module('client.history.module').component('clientHistory', {
        bindings: {},
        controllerAs: 'clientHistoryCtrl',
        controller: function clientHistoryController() {

        },
        templateUrl: '/static/js/v0.2/components/clientHistory/partials/clientHistory.template.html'
    });
});
