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

        function mergeReject(invite, clients) {
            var client = _.find(clients, {_id: invite._id});
            if (!client) {
                client = invite;
                clients.splice(0, 0, client);
            }
            client.mode = modes.common;
        }

        function mergeInvite(invite, clients) {
            var client = _.find(clients, {_id: invite._id});
            if (!client) {
                client = invite;
                clients.splice(0, 0, client);
            }
            client.mode = modes.invite;
        }

        function prepareClientForUI(client) {
            client.mode = modes.common;
            return client;
        }

        return {
            mergeInvite: mergeInvite,
            mergeReject: mergeReject,
            prepareClientForUI: prepareClientForUI
        }
    }
});