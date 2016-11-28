define([
    'angular',
    '../genericPopup.module',
    '../controllers/genericPopup.controller'
], function(angular) {
    'use strict';

    angular.module('genericPopup.module').component('genericPopup', {
        bindings: {
            isVisible: '>'
        },
        controller: 'genericPopupCtrl',
        controllerAs: 'genericPopupCtrl',
        templateUrl: '/static/js/v0.2/components/genericPopup/partials/genericPopup.template.html',
        transclude: true
    });

});
