define([
    'angular',
    'lodash',
    'components/playerColor/playerColor.module',
    'components/playerColor/factories/playerColorConfig.factory'
], function (angular, _) {
    'use strict';

    angular.module('playerColor.module').controller('playerColorCtrl', playerColorCtrl);

    function playerColorCtrl(playerColorConfigFactory, $scope) {
        var vm = this;

        vm.options = _.extend(playerColorConfigFactory.getDefaultOptions(), vm.options);

        $scope.$watch('playerColorCtrl.color', vm.onColorChange);

    }
});

