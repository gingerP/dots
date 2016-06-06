define([
    'angular',
    '../invitePopup.module',
    '../controllers/invitePopup.controller',
    '../../genericPopup/components/genericPopup.component'
], function(angular) {
    'use strict';

    angular.module('invitePopup.module').component('invitePopup', {
        bindings: {},
        controller: 'invitePopupCtrl',
        controllerAs: 'invitePopupCtrl',
        templateUrl: '/static/js/v0.2/components/invitePopup/partials/invitePopup.template.html'
    });

});
