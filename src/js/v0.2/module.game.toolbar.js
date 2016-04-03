define([
    'handlebars'
], function (Handlebars) {
    'use strict';

    var api;
    var business;
    var templates = {
        player: Handlebars.compile(document.getElementById('template-players').innerHTML)
    };
    var templatesPlaceholders = {
        player: document.getElementById('players')
    };

    function listenPlayers() {
        var players = business.getPlayers();
        var activePlayer = business.getActivePlayer();
        var data = {
            players: players.map(function (player) {
                return {
                    id: player.getId(),
                    name: player.getName(),
                    color: player.getColor(),
                    active: player === activePlayer
                }
            })
        };
        templatesPlaceholders.player.innerHTML = templates.player(data);
    }

    function init(module) {
        business = module;
        business.addListener(business.listen.change_active_player, listenPlayers, true);
        business.addListener(business.listen.add_player, listenPlayers, true);
    }

    api = {
        init: init
    };
    return api;
});