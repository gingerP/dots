define([
    'angular',
    'lodash',
    'components/utils/scope.utils',
    'components/utils/game.utils',
    'components/constants/events.constant',
    'module.storage',
    'module.game.business',
    'module.backend.service',
    'components/clientsList/factories/clientsListUtil.factory',
    'components/clientsList/clientsList.module'
], function (angular, _, scopeUtils, gameUtils, events, storage, Business, backend) {
    'use strict';

    angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

    function ClientsListController($rootScope, $scope, clientsListUtilFactory) {
        var vm = this,
            myself;

        vm.clientsList = [];
        vm.opponent = gameUtils.getOpponent();

        function listenPlayers(pack) {
            vm.clientsList.push(pack);
            $scope.$apply();
        }

        function rejectClient(exclusionsIdsList) {
            return function(client) {
                return exclusionsIdsList.indexOf(client._id) > -1;
            }
        }

        //Business.addListener(Business.listen.add_client, listenPlayers, true);

        vm.invite = function invite(client) {
            Business.invite.ask(client._id).then(function () {

            }, function () {

            })
        };

        vm.submitInvite = function (toClient) {
            backend.emit.inviteSuccess(toClient._id);
        };

        vm.rejectInvite = function (toClient) {
            var client = _.find(vm.clientsList, {_id: toClient._id});
            client.mode = 'common';
            backend.emit.inviteReject(toClient._id);
        };

        backend.emit.getMyself().then(function (client) {
            myself = client;
        }).then(function () {
            return backend.emit.getClients();
        }).then(function (clients) {
            var exclusion = vm.opponent ? [myself._id, vm.opponent._id] : [myself._id];
            clients = _.map(clients, clientsListUtilFactory.prepareClientForUI);
            vm.clientsList = _.reject(clients, rejectClient(exclusion));
            $scope.$apply();
        });


        scopeUtils.onRoot($scope, events.INVITE, function (message) {
            if (message.from) {
                $rootScope.$emit(events.INVITE, message.from);
                clientsListUtilFactory.setInvite(message.from, vm.clientsList);
                $scope.$apply();
            }
        });

        scopeUtils.onRoot($scope, events.CREATE_GAME, function (message) {
            var myself = storage.getClient();
            if (message.from && message.to && message.game) {
                clientsListUtilFactory.setSuccess(message.opponent, vm.clientsList);
                $scope.$apply();
            }
        });

        scopeUtils.onRoot($scope, events.CANCEL_GAME, function (message) {
            var myself = storage.getClient();
            if (message.game && message.opponent) {
                clientsListUtilFactory.setCancelGame(message.opponent, vm.clientsList);
                $scope.$apply();
            }
        });

        scopeUtils.onRoot($scope, events.INVITE_REJECT, function (message) {
            if (message.to) {
                clientsListUtilFactory.setReject(message.to, vm.clientsList);
                $scope.$apply();
            }
        });
    }
});
