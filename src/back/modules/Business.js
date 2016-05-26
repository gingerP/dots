var _ = require('lodash');
'use strict';
var Business = (function() {
    var api;
    var clients = [];
    var listen = {
        add_client: 'new_connection',
        add_dot: 'add_dot',
        clients: 'clients'
    };
    var games = [];
    var listener = {
        addClient: function(client) {
            clients.push(client);
            games()
            notifyClients(createPack.addClient(client));

        },
        addDot: function() {

        }
    };
    var createPack = {
        addClient: function(client) {
            return {
                type: listen.add_client,
                content: client.getId()
            }
        },
        game: function(client) {
            return {
                clients: [client.getId()]
            }
        }
    };

    function notifyClients(pack) {
        _.forEach(clients, function(client) {
            client.sentData(pack);
        });
    }

    function init(wsServer) {
        wsServer.addListener(listen.add_client, listener.addClient);
        wsServer.addListener(listen.add_dot, listener.addDot);
    }

    api = {
        init: init
    };

    return api;
})();

module.exports = Business;