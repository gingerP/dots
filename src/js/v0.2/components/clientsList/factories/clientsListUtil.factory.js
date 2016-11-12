define([
    'angular',
    'lodash',
    'business/game.storage',
    '../clientsList.module'
], function(angular, _, GameStorage) {
    'use strict';

    angular.module('clientsList.module').factory('clientsListUtil', clientsListUtilFactory);

    function clientsListUtilFactory() {
        var modes = {
            common: 'common',
            invite: 'invite'
        };

        function getClientsHashes(clients) {
            return _.map(clients, '_id');
        }

        function getClientHash(client) {
            return client._id;
        }

        function setCancelGame(opponent, clients) {
            var isInList = _.find(clients, {_id: opponent._id});
            if (!isInList) {
                clients.push(opponent);
                opponent.mode = modes.common;
            }
        }

        function setSuccess(invite, clients) {
            var clientIndex = _.findIndex(clients, {_id: invite._id});
            return clients.splice(clientIndex, 1)[0];
        }

        function setReject(invite, clients) {
            var client = _.find(clients, {_id: invite._id});
            if (!client) {
                client = invite;
                clients.splice(0, 0, client);
            }
            client.mode = modes.common;
        }

        function setInvite(invite, clients) {
            var clientIndex = _.findIndex(clients, {_id: invite._id});
            var client;
            if (clientIndex > 0) {
                client = clients.splice(clientIndex, 1)[0];
                clients.splice(0, 0, client);
            } else if (clientIndex === -1) {
                clients.splice(0, 0, invite);
                client = clients[0];
            } else {
                client = clients[0];
            }
            clients[0].mode = modes.invite;
        }

        function prepareClientForUI(client) {
            var preparedClient = _.cloneDeep(client);
            preparedClient.mode = modes.common;
            return preparedClient;
        }

        function filterReconnectedClients(reconnectedClients, existClients) {
            var opponent = GameStorage.getOpponent();
            var myself = GameStorage.getClient();
            var existClientsHashes = getClientsHashes(existClients);
            return _.filter(reconnectedClients, function (client) {
                return existClientsHashes.indexOf(getClientHash(client)) < 0
                    && (opponent && client._id !== opponent._id || client._id !== myself);
            });
        }

        function removeDisconnectedClients(disconnectedClientsIds, existClients) {
            var index = existClients.length - 1;

            while (index >= 0) {
                if (disconnectedClientsIds.indexOf(existClients[index]._id) >= 0) {
                    existClients.splice(index, 1);
                }
                index--;
            }
            return existClients;
        }

        return {
            setSuccess: setSuccess,
            setInvite: setInvite,
            setReject: setReject,
            setCancelGame: setCancelGame,
            prepareClientForUI: prepareClientForUI,
            filterReconnectedClients: filterReconnectedClients,
            removeDisconnectedClients: removeDisconnectedClients
        };
    }
});
