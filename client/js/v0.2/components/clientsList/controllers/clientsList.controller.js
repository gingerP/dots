define([
    'angular',
    'lodash',
    'module.observable',
    'services/business/game.storage',
    'common/events',
    'utils/constants',
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

        function recalculateRelativeRating(users) {
            _.forEach(users, function (client) {
                var rating = client.rating || Constants.PLAYER.DEFAULT_RATING;
                client.relativeRating = rating * 100 / vm.maxRating;
            });
            return users;
        }

        function showHideUsersByInvites() {
            _.forEach(vm.clientsList, function (user) {
                user.isVisible = true;
            });
            _.forEach(vm.invites, function (invite) {
                var user = _.find(vm.clientsList, {_id: invite._id});
                if (user) {
                    user.isVisible = false;
                }
            });
        }

        function reloadInvites() {
            gameDataService.getInvites().then(function (response) {
                vm.invites = response;
                recalculateRelativeRating(vm.invites);
                showHideUsersByInvites();
                scopeUtils.apply($scope);
            });
        }

        function reloadClients() {
            return gameDataService.getClients(vm.query).then(function (response) {
                var meta = response.meta;
                var clients = response.list;
                vm.maxRating = response.maxRate;
                vm.totalCount = meta.totalCount;
                vm.hasNext = hasNext();
                if (meta.page === 1) {
                    vm.clientsList = clients;
                } else {
                    vm.clientsList = vm.clientsList.concat(clients);
                }
                recalculateRelativeRating(vm.clientsList);
                scopeUtils.apply($scope);
            });
        }

        function onInvite(message) {
            observable.emit(Events.INVITE, message.from);
            clientsListUtil.setInvite(message.from, vm);
            scopeUtils.apply($scope);
        }

        function onCreateGame(message) {
            clientsListUtil.setSuccess(message.opponent, vm);
            scopeUtils.apply($scope);
        }

        function onCancelGame() {
            initialLoad();
            scopeUtils.apply($scope);
        }

        function onInviteReject(message) {
            clientsListUtil.setReject(message.to, vm.clientsList);
            scopeUtils.apply($scope);
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

        function initialLoad() {
            vm.query.page = 1;
            reloadClients().then(reloadInvites);
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

        $scope.$watch('clientsListCtrl.query.search', function (newSearch, oldSearch) {
            if (newSearch !== oldSearch) {
                vm.query.page = 1;
                reloadClients();
            }
        });

        initialLoad();
    }
});
