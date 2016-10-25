define([
    'angular',
    'lodash',
    'module.observable',
    'business/game.storage',
    'common/events',
    'module.game.business',
    'business/business.invite',
    'module.backend.service',
    'common/services/game-data.service',
    'components/clientsList/factories/clientsListUtil.factory',
    'components/clientsList/clientsList.module',
    'components/utils/scope.utils'
], function (angular, _, Observable, GameStorage, Events, Business, inviteBusiness, backend,
             gameDataService) {
    'use strict';

    angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

    function ClientsListController(scopeUtils, $scope, clientsListUtilFactory) {
        var vm = this,
            observable = Observable.instance;

        vm.clientsList = [];

        function rejectClient(exclusionsIdsList) {
            return function(client) {
                return exclusionsIdsList.indexOf(client._id) > -1;
            };
        }

        function updateClient() {
            reloadClients();
        }

        function reloadClients() {
            gameDataService.getClients().then(function (clients) {
                var preparedClients = _.map(clients, clientsListUtilFactory.prepareClientForUI);
                var myself = GameStorage.getClient();
                var opponent = GameStorage.getOpponent();
                var exclusion = opponent ? [myself._id, opponent._id] : [myself._id];
                vm.clientsList = _.reject(preparedClients, rejectClient(exclusion));
                scopeUtils.apply($scope);
            });
        }

        function invite(message) {
            if (message.from) {
                observable.emit(Events.INVITE, message.from);
                clientsListUtilFactory.setInvite(message.from, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function createGame(message) {
            if (message.from && message.to && message.game) {
                clientsListUtilFactory.setSuccess(message.opponent, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function onCancelGame(data) {
            if (data.opponent) {
                clientsListUtilFactory.setCancelGame(data.opponent, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function inviteReject(message) {
            if (message.to) {
                clientsListUtilFactory.setReject(message.to, vm.clientsList);
                scopeUtils.apply($scope);
            }
        }

        function newClient(client) {
            var preparedClient = clientsListUtilFactory.prepareClientForUI(client);
            vm.clientsList.splice(0, 0, preparedClient);
            scopeUtils.apply($scope);
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

        observable.on(Events.NEW_CLIENT, newClient);
        observable.on(Events.REFRESH_MYSELF, updateClient);
        observable.on(Events.INVITE, invite);
        observable.on(Events.CREATE_GAME, createGame);
        observable.on(Events.CANCEL_GAME, onCancelGame);
        observable.on(Events.INVITE_REJECT, inviteReject);

        updateClient();
    }
});
