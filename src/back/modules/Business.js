var _ = require('lodash');
var Service = require('./Service');
var Client = require('./Client');
var logger = _req('src/js/logger').create('Business');

var Business = (function() {
    'use strict';
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
    var TOPIC = 'dots';
    var games = [];
    var listener = {
        newConnection: function(clientConnection) {
            var client = new Client(clientConnection);
            clients.push(client);
            Service.notifyClients(clients, Service.event.add_client, {
                id: client.getId(),
                name: client.getName()
            });
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
            var partnerId = pack.data.clients && pack.data.clients.length ? pack.data.clients[0]: null;
            if (partnerId) {
                var partner = utils.getClientById(partnerId);
                if (partner) {
                    Service.inviteClient.ask(pack.client, partner);
                } else {
                    logger.warn('Didnt find client for id \'' + partnerId + '\'');
                }
            } else {
                logger.warn('Empty client list to invite!');
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
    };

    function notifyClients(pack, clients) {
        _.forEach(_.isArray(clients) ? clients : [clients], function(client) {
            client.getConnection().sendData(pack, TOPIC);
        });
    }

    function preProcessInboundData(handler) {
        //TODO is client from connection has the same id as client from list ?
        return function(data) {
            handler({
                client: utils.getClientById(data.client.getId()),
                data: data.data
            });
        }
    }

    function init(wsServer) {
        var e = Service.event;
        Service.init(wsServer);
        Service.on(e.new_connection, listener.newConnection);
        Service.on(e.add_dot, preProcessInboundData(listener.addDot));
        Service.on(e.update_client_id, preProcessInboundData(listener.updateClientId));
        Service.on(e.invite, preProcessInboundData(listener.inviteToPlay));
    }

    api = {
        init: init
    };

    return api;
})();

module.exports = Business;