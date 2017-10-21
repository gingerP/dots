define([
    'angular',
    'module.observable',
    'common/events',
    'services/business/game.storage',
    'services/business/module.game.business',
    'components/active-game/active-game.module',
    'components/utils/scope.utils'
], function (angular, Observable, Events, GameStorage, GameBusiness) {
    'use strict';

    angular.module('active-game.module').controller('activeGameCtrl', ActiveGameCtrl);

    function ActiveGameCtrl($scope, scopeUtils) {
        var vm = this,
            observable = Observable.instance;

        function onRefreshGame() {
            vm.opponent = GameStorage.getGameOpponent();
            scopeUtils.apply($scope);
        }

        function offerToComplete() {
            GameBusiness
                .offerToComplete()
                .then();
        }

        function offerDraw() {
            GameBusiness
                .gameOfferDraw()
                .then();
        }

        function gaveUp() {
            GameBusiness
                .gameGaveUp()
                .then();
        }

        observable.on(Events.REFRESH_GAME, onRefreshGame);
        vm.offerToComplete = offerToComplete;
        vm.offerDraw = offerDraw;
        vm.gaveUp = gaveUp;
        onRefreshGame();
    }
});
