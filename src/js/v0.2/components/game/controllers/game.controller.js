define([
    'angular',
    'module.storage',
    'components/constants/events.constant',
    'module.backend.service',
    'components/game/game.module'
], function(angular, storage, events, backend) {
    'use strict';

    angular.module('game.module').controller('gameCtrl', gameCtrl);

    function gameCtrl($rootScope) {

        function getOpponent(clientA, clientB) {
            var myself = storage.getClient();
            return clientA._id === myself._id ? clientB : clientA;
        }

        backend.listen.invitePlayer(function(message) {
            if (message.from) {
                $rootScope.$emit(events.INVITE, message);
            }
        });

        backend.listen.inviteSuccessPlayer(function(message) {
            if (message.to) {
                message.opponent = getOpponent(message.to, message.from);
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