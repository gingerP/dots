define([
    'angular',
    'components/utils/scope.utils',
    'components/constants/events.constant',
    'components/playerMenu/playerMenu.module'
], function(angular, scopeUtils, events) {
    'use strict';

    angular.module('player.menu.module').controller('playerMenuController', playerMenuController);

    function playerMenuController($scope) {
        var vm = this;

        vm.isMenuClosed = true;

        scopeUtils.onRoot($scope, events.MENU_VISIBILITY, function(isVisible) {
            vm.isMenuClosed = !isVisible;
        });
    }
});