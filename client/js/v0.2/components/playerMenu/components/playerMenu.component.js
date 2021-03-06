define([
    'angular',
    'components/playerMenu/playerMenu.module',
    'components/playerMenu/controllers/playerMenu.controller',
    'components/clientsList/components/clientsList.component',
    'components/signin/components/signin.component',
    'components/clientHistory/component/clientHistory.component',
    'components/tabbar/components/tabbar.component',
    'components/tabbarHeader/components/tabbarHeader.component',
    'components/active-game/components/active-game.component'
], function(angular) {
    'use strict';

    angular.module('player.menu.module').component('playerMenu', {
        bindings: {},
        templateUrl: '/static/js/v0.2/components/playerMenu/partials/playerMenu.template.html',
        controller: 'playerMenuController',
        controllerAs: 'playerMenuCtrl'
    });

});