define([
    'handlebars',
    'jquery'
], function (Handlebars, $) {
    'use strict';

    var CLASS_TOOLBAR = 'toolbar';
    var CLASS_ACTIVE = 'active-player';
    var CLASS_NOT_ACTIVE = 'not-active-player';
    var CLASS_PLAYERS_FREEZE = 'players-freeze';

    var api;
    var business;
    var toolbarUi = $('.' + CLASS_TOOLBAR);
    var button = {
        restart: $('[name=restart]', toolbarUi),
        copy: $('[name=copy]', toolbarUi),
        next: $('#players', toolbarUi)
    };

    var templates = {
        player: Handlebars.compile(document.getElementById('template-players').innerHTML)
    };
    var templatesPlaceholders = {
        player: $('#players')
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
        templatesPlaceholders.player.html(templates.player(data));
        dom.players = $('.player', templatesPlaceholders.player);
    }

    function listenChangeActivePlayer(activePlayer) {
        var uiId = createPlayerUiId(activePlayer.getId());
        var activePlayerUi = $('#' + uiId, templatesPlaceholders.player);
        dom.players.removeClass(CLASS_ACTIVE).addClass(CLASS_NOT_ACTIVE);
        activePlayerUi.removeClass(CLASS_NOT_ACTIVE).addClass(CLASS_ACTIVE);
        templatesPlaceholders.player.addClass(CLASS_PLAYERS_FREEZE);
    }

    function listenAddDot(dot) {
        if (business.canChangeActivePlayer()) {
            enableNextButton(true);
        }
    }

    function initEvents() {
        button.next.click(function() {
            business.makeNextPlayerActive();
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