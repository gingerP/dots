define([
    'angular',
    'lodash',
    'module.observable',
    'services/business/game.storage',
    'common/events',
    'common/common-constants',
    'services/business/module.game.business',
    'services/business/business.invite',
    'services/backend/game-data.service',
    'components/clientsList/factories/clientsListUtil.factory',
    'components/clientsList/clientsList.module',
    'components/utils/scope.utils'
], function (angular, _, Observable, GameStorage, Events, Constants, Business, inviteBusiness, gameDataService) {
    'use strict';

    angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

    function ClientsListController(scopeUtils, $scope, clientsListUtil) {
        var vm = this,
            observable = Observable.instance;

        vm.clientsList = [];
        vm.totalCount = 0;
        vm.maxRating = Constants.PLAYER.DEFAULT_RATING;
        vm.query = {
            search: '',
            isOnline: true,
            page: 1,
            pageSize: 30,
            excludeGameUsers: true
        };

        function hasNext() {
            return vm.query.page * vm.query.pageSize < vm.totalCount;
        }

        function updateClient() {
            //reloadClients();
        }

        function recalculateRelativeRating() {
            _.forEach(vm.clientsList, function (client) {
                var rating = client.rating || Constants.PLAYER.DEFAULT_RATING;
                client.relativeRating = rating * 100 / vm.maxRating;
            });
        }

        function reloadClients() {
            gameDataService.getClients(vm.query).then(function (response) {
                var meta = response.meta;
                var clients = response.list;
                var preparedClients = _.map(clients, clientsListUtil.prepareClientForUI);
                vm.maxRating = response.maxRate;
                vm.totalCount = meta.totalCount;
                vm.hasNext = hasNext();
                if (meta.page === 1) {
                    vm.clientsList = preparedClients;
                } else {
                    vm.clientsList = vm.clientsList.concat(preparedClients);
                }
                recalculateRelativeRating();
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

        vm.loadNext = function loadNext() {
            if (hasNext()) {
                vm.query.page++;
                reloadClients();
            }
        };

        observable.on(Events.CLIENTS_RECONNECT, onClientsReconnected);
        observable.on(Events.CLIENTS_DISCONNECT, onClientsDisconnected);
        observable.on(Events.NEW_CLIENT, onNewClient);
        observable.on(Events.REFRESH_MYSELF, updateClient);
        observable.on(Events.INVITE, onInvite);
        observable.on(Events.CREATE_GAME, onCreateGame);
        observable.on(Events.CANCEL_GAME, onCancelGame);
        observable.on(Events.INVITE_REJECT, onInviteReject);

        $scope.$watch('clientsListCtrl.query.search', function () {
            vm.query.page = 1;
            reloadClients();
        });

        updateClient();
    }
});
