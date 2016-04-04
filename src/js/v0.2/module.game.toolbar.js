define([
    'handlebars'
], function (Handlebars) {
    'use strict';

    var api;
    var business;
    var toolbarUi = $('.' + CLASS_TOOLBAR);
    var button = {
        restart: $('[name=restart]', toolbarUi),
        copy: $('[name=copy]', toolbarUi),
        next: $('[name=next]', toolbarUi)
    };

    var CLASS_TOOLBAR = 'toolbar';
    var CLASS_ACTIVE = 'active-player';

    var templates = {
        player: Handlebars.compile(document.getElementById('template-players').innerHTML)
    };
    var templatesPlaceholders = {
        player: document.getElementById('players')
    };
    var dom = {
        players: null
    };

    function createPlayerUiId(id) {
        return 'player_' + id;
    }

    function listenPlayers() {
        var players = business.getPlayers();
        var activePlayer = business.getActivePlayer();
        var data = {
            players: players.map(function (player) {
                return {
                    id: createPlayerUiId(player.getId()),
                    name: player.getName(),
                    color: player.getColor(),
                    active: player === activePlayer
                }
            })
        };
        templatesPlaceholders.player.innerHTML = templates.player(data);
        dom.players = $('>', templatesPlaceholders.player);
    }

    function listenChangeActivePlayer(activePlayer) {
        var uiId = createPlayerUiId(activePlayer.getId());
        var activePlayerUi;
        dom.players.removeClass(CLASS_ACTIVE);
        activePlayerUi = document.getElementById(uiId);
        if (activePlayerUi) {
            activePlayer.className += ' ' + CLASS_ACTIVE;
        }
    }

    function listenAddDot(dot) {
        if (business.canChangeActivePlayer()) {
            enableNextButton(true);
        }
    }

    function initEvents() {
        dom.players.click(function() {

        });
        button.next.click(function() {
            business.makeNextPlayerActive().then()
        });
    }

    function enableNextButton(state) {
        state = typeof(state) == 'boolean'? state: true;
        console.info('Enable next button: ' + state);
    }

    function init(module) {
        business = module;
        business.addListener(business.listen.change_active_player, listenChangeActivePlayer, true);
        business.addListener(business.listen.add_player, listenPlayers, true);
        business.addListener(business.listen.add_dot, listenAddDot, true);

        initEvents();
    }

    api = {
        init: init
    };
    return api;
});