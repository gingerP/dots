define([
    'angular',
    'lodash',
    'module.observable',
    'components/utils/scope.utils',
    'business/game.storage',
    'components/constants/events.constant',
    'module.game.business',
    'business/business.invite',
    'module.backend.service',
    'components/clientsList/factories/clientsListUtil.factory',
    'components/clientsList/clientsList.module'
], function (angular, _, Observable, scopeUtils, gameStorage, events, Business, inviteBusiness, backend) {
    'use strict';

    angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

    function ClientsListController($rootScope, $scope, clientsListUtilFactory) {
        var vm = this,
            observable = Observable.instance;

        vm.clientsList = [];
        vm.opponent;

        function listenPlayers(pack) {
            vm.clientsList.push(pack);
            $scope.$apply();
        }

        function rejectClient(exclusionsIdsList) {
            return function(client) {
                return exclusionsIdsList.indexOf(client._id) > -1;
            }
        }

        function updateClient() {
            backend.emit.getClients().then(function (clients) {
                var myself = gameStorage.getClient();
                var opponent = gameStorage.getOpponent();
                var exclusion = opponent ? [myself._id, opponent._id] : [myself._id];
                clients = _.map(clients, clientsListUtilFactory.prepareClientForUI);
                vm.clientsList = _.reject(clients, rejectClient(exclusion));
                $scope.$apply();
            });
        }

        function invite(message) {
            if (message.from) {
                observable.emit(events.INVITE, message.from);
                clientsListUtilFactory.setInvite(message.from, vm.clientsList);
                $scope.$apply();
            }
        }

        function createGame(message) {
            if (message.from && message.to && message.game) {
                clientsListUtilFactory.setSuccess(message.opponent, vm.clientsList);
                $scope.$apply();
            }
        }

        function cancelGame(message) {
            if (message.game && message.opponent) {
                clientsListUtilFactory.setCancelGame(message.opponent, vm.clientsList);
                $scope.$apply();
            }
        }

        function inviteReject(message) {
            if (message.to) {
                clientsListUtilFactory.setReject(message.to, vm.clientsList);
                $scope.$apply();
            }
        }

        vm.invite = function invite(client) {
            inviteBusiness.ask(client._id).then(function () {

            }, function () {

            })
        };

        vm.submitInvite = function (toClient) {
            inviteBusiness.success(toClient._id);
        };

        vm.rejectInvite = function (toClient) {
            var client = _.find(vm.clientsList, {_id: toClient._id});
            client.mode = 'common';
            inviteBusiness.reject(toClient._id);
        };

        $scope.$on('$destroy', observable.on(events.UPDATE_CLIENT, updateClient));
        $scope.$on('$destroy', observable.on(events.INVITE, invite));
        $scope.$on('$destroy', observable.on(events.CREATE_GAME, createGame));
        $scope.$on('$destroy', observable.on(events.CANCEL_GAME, cancelGame));
        $scope.$on('$destroy', observable.on(events.INVITE_REJECT, inviteReject));

        updateClient();
    }
});
