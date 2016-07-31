define([
    'angular',
    'components/playerMenu/playerMenu.module',
    'components/playerMenu/controllers/playerMenu.controller',
    'components/clientsList/components/clientsList.component'
], function(angular) {
    'use strict';

    angular.module('player.menu.module').component('playerMenu', {
        templateUrl: '/static/js/v0.2/components/playerMenu/partials/playerMenu.template.html',
        controller: 'playerMenuController',
        controllerAs: 'playerMenuCtrl'
    });

});