define([
    'angular',
    'lodash',
    'services/business/game.storage',
    'components/clientsList/clientsList.module'
], function (angular, _, GameStorage) {
    'use strict';

    angular.module('clientsList.module').factory('clientsListUtil', clientsListUtilFactory);

    function clientsListUtilFactory() {
        function getClientsHashes(clients) {
            return _.map(clients, '_id');
        }

        function getClientHash(client) {
            return client._id;
        }

        function setCancelGame(opponent, ctrl) {
            var opponentInList = _.find(ctrl.clientsList, {_id: opponent._id});
            if (opponentInList) {
                opponentInList.isVisible = true;
            }
        }

        function setSuccess(invite, ctrl) {
            var clientIndex = _.findIndex(ctrl.clientsList, {_id: invite._id});
            if (clientIndex >= 0) {
                ctrl.clientsList.splice(clientIndex, 1);
            }
            ctrl.invites = [];
        }

        function setReject(invite, ctrl) {
            var client = _.find(ctrl.clientsList, {_id: invite._id});
            var existInviteIndex = _.findIndex(ctrl.invites, {_id: invite._id});
            if (!client) {
                client.isVisible = true;
            }
            if (existInviteIndex >= 0) {
                ctrl.invites.splice(existInviteIndex, 1);
            }
        }

        function setInvite(invite, ctrl) {
            var user = _.find(ctrl.clientList, {_id: invite._id});
            if (user) {
                user.isVisible = false;
            }
            if (!_.find(ctrl.invites, {_id: invite})) {
                ctrl.invites.push(invite);
            }
        }

        function filterReconnectedClients(reconnectedClients, existClients) {
            var opponent = GameStorage.getOpponent();
            var myself = GameStorage.getClient();
            var existClientsHashes = getClientsHashes(existClients);
            return _.filter(reconnectedClients, function (client) {
                return existClientsHashes.indexOf(getClientHash(client)) < 0
                    && client._id !== myself._id && (!opponent || client._id !== opponent._id);
            });
        }

        return {
            setSuccess: setSuccess,
            setInvite: setInvite,
            setReject: setReject,
            setCancelGame: setCancelGame,
            filterReconnectedClients: filterReconnectedClients
        };
    }
});
