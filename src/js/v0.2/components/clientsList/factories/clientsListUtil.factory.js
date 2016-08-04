define([
    'angular',
    'lodash',
    '../clientsList.module'
], function(angular, _) {
    'use strict';

    angular.module('clientsList.module').factory('clientsListUtilFactory', clientsListUtilFactory);

    function clientsListUtilFactory() {
        var modes = {
            common: 'common',
            invite: 'invite'
        };

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
            client.mode = modes.common;
            return client;
        }

        return {
            setSuccess: setSuccess,
            setInvite: setInvite,
            setReject: setReject,
            setCancelGame: setCancelGame,
            prepareClientForUI: prepareClientForUI
        }
    }
});