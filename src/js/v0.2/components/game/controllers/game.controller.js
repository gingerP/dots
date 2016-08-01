define([
    'angular',
    'components/constants/events.constant',
    'module.backend.service',
    'components/game/game.module'
], function(angular, events, backend) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {

        backend.listen.invitePlayer(function(message) {
            if (message.from) {
                $rootScope.$emit(events.INVITE, message);
            }
        });

        backend.listen.inviteSuccessPlayer(function(message) {
            if (message.to) {
                $rootScope.$emit(events.CREATE_GAME, message);
            }
        });

        backend.listen.inviteRejectPlayer(function(message) {
            if (message.to) {
                $rootScope.$emit(events.INVITE_REJECT, message);
            }
        });
    }
});