define([
    'angular',
    'services/business/module.game.business',
    '../invitePopup.module'
], function (angular, Business) {
    'use strict';

    angular.module('invitePopup.module').controller('invitePopupCtrl', GenericPopupController);

    function GenericPopupController() {
        var vm = this;
        vm.isPopupVisible = false;

        Business.addListener(Business.event.invite_player, function (pack) {
            if (pack.action === 'ask') {
                vm.isPopupVisible = true;
                vm.name = pack.from;
            }
        });

    }
});

