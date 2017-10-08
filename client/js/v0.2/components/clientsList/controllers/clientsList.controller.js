define([
    'angular',
    'lodash',
    'module.observable',
    'services/business/game.storage',
    'common/events',
    'services/business/module.game.business',
    'services/business/business.invite',
    'services/backend/game-data.service',
    'components/clientsList/factories/clientsListUtil.factory',
    'components/clientsList/clientsList.module',
    'components/utils/scope.utils'
], function (angular, _, Observable, GameStorage, Events, Business, inviteBusiness,
             gameDataService) {
    'use strict';

    angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

    function ClientsListController(scopeUtils, $scope, clientsListUtil) {
        var vm = this,
            observable = Observable.instance;

        vm.clientsList = [];

        function rejectClient(exclusionsIdsList) {
            return function (client) {
                return exclusionsIdsList.indexOf(client._id) > -1;
            };
        }

        function updateClient() {
            reloadClients();
        }

        function reloadClients() {
            gameDataService.getClients().then(function (clients) {
                var preparedClients = _.map(clients, clientsListUtil.prepareClientForUI);
                var myself = GameStorage.getClient();
                var opponent = GameStorage.getOpponent();
                var exclusion = opponent ? [myself._id, opponent._id] : [myself._id];
                vm.clientsList = _.reject(preparedClients, rejectClient(exclusion));
                scopeUtils.apply($scope);
            });
        }

        function onInvite(message) {
            if (message.from) {
                observable.emit(Events.INVITE, message.from);
                clientsListUtil.setInvite(message.from, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function onCreateGame(message) {
            if (message.from && message.to && message.game) {
                clientsListUtil.setSuccess(message.opponent, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function onCancelGame(data) {
            if (data.opponent) {
                clientsListUtil.setCancelGame(data.opponent, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function onInviteReject(message) {
            if (message.to) {
                clientsListUtil.setReject(message.to, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function onNewClient(client) {
            var preparedClient = clientsListUtil.prepareClientForUI(client);
            vm.clientsList.splice(0, 0, preparedClient);
            scopeUtils.apply($scope);
        }

        function onClientsReconnected(clients) {
            var filteredClients = clientsListUtil.filterReconnectedClients(clients, vm.clientsList);
            if (filteredClients.length) {
                filteredClients = _.map(filteredClients, clientsListUtil.prepareClientForUI);
                vm.clientsList.push.apply(vm.clientsList, filteredClients);
                scopeUtils.apply($scope);
            }
        }

        function onClientsDisconnected(clientIds) {
            var oldCount = vm.clientsList.length;
            vm.clientsList = clientsListUtil.removeDisconnectedClients(clientIds, vm.clientsList);
            if (oldCount !== vm.clientsList.length) {
                scopeUtils.apply($scope);
            }
        }

        vm.invite = function (client) {
            inviteBusiness.ask(client._id);
        };

        vm.submitInvite = function (toClient) {
            inviteBusiness.success(toClient._id);
        };

        vm.rejectInvite = function (toClient) {
            var client = _.find(vm.clientsList, {_id: toClient._id});
            client.mode = 'common';
            inviteBusiness.reject(toClient._id);
        };

        observable.on(Events.CLIENTS_RECONNECT, onClientsReconnected);
        observable.on(Events.CLIENTS_DISCONNECT, onClientsDisconnected);
        observable.on(Events.NEW_CLIENT, onNewClient);
        observable.on(Events.REFRESH_MYSELF, updateClient);
        observable.on(Events.INVITE, onInvite);
        observable.on(Events.CREATE_GAME, onCreateGame);
        observable.on(Events.CANCEL_GAME, onCancelGame);
        observable.on(Events.INVITE_REJECT, onInviteReject);

        updateClient();
    }
});
