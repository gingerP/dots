var _ = require('lodash');
var Client = require('./Client');
'use strict';
var Business = (function() {
    var api;
    var clients = [];
    var listen = {
        new_connection: 'new_connection',
        invite_to_play: 'invite_to_play',
        approve_to_play: 'approve_to_play',
        begin_play: 'begin_play',
        add_client: 'add_client',
        add_dot: 'add_dot',
        update_client_id: 'update_client_id',
        clients: 'clients'
    };
    var games = [];
    var listener = {
        newConnection: function(clientConnection) {
            var client = new Client(clientConnection);
            clients.push(client);
            notifyClients(createPack.addClient(client), clients);
        },
        addDot: function() {

        },
        /**
        * {newClientId: Number, oldClientId: Number}
        */
        updateClientId: function(data) {
            _.forEach(clients, function(client) {
                if (client.getId() === data.newClientId) {

                }
            });
        },
        inviteToPlay: function(pack) {
            var partner = utils.getClientById(pack.data.id);
            var invite;
            if (partner) {
                invite = createPack.inviteToPlay(partner.getId(), partner.getName());
                notifyClients(invite, partner);
            }
        },
        approveToPlay: function(pack) {
            var partners;
            var invite;
            if (pack.data.isApproved === true) {
                partners = utils.getClientsByIds([pack.client.getId(), pack.data.id]);
                invite = createPack.beginToPlay(partners);
                notifyClients(invite, partners);
            }
        }
    };
    var createPack = {
        addClient: function(client) {
            return {
                type: listen.add_client,
                id: client.getId(),
                name: client.getName()
            }
        },
        game: function(client) {
            return {
                clients: [client.getId()]
            }
        },
        inviteToPlay: function(clientId, name) {
            return {
                type: listen.invite_to_play,
                id: clientId,
                name: name
            }
        },
        beginToPlay: function(clients) {
            return {
                type: listen.begin_play,
                clients: _.map(clients, function(client) {
                    return {
                        id: client.getId(),
                        name: client.getName()
                    };
                })
            };
        }
    };
    var utils = {
        getClientById: function(id) {
            return _.find(clients, function(client) {
                return client.getId() === id;
            });
        },
        getClientsByIds: function(ids) {
            return _.filter(clients, function(client) {
                return ids.indexOf(client.getId()) >= 0;
            });
        }
    }

    function notifyClients(pack, clients) {
        _.forEach(_.isArray(clients) ? clients : [clients], function(client) {
            client.getConnection().sendData(pack);
        });
    }

    function init(wsServer) {
        wsServer.addListener(listen.new_connection, listener.newConnection);
        wsServer.addListenerIn(listen.add_dot, listener.addDot);
        wsServer.addListenerIn(listen.update_client_id, listener.updateClientId);
        wsServer.addListenerIn(listen.invite_to_play, listener.inviteToPlay);
        wsServer.addListenerIn(listen.approve_to_play, listener.approveToPlay);
    }

    api = {
        init: init
    };

    return api;
})();

module.exports = Business;