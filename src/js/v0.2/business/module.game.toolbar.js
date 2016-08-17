define([
    'handlebars',
    'jquery'
], function (Handlebars, $) {
    'use strict';

    var CLASS_TOOLBAR = 'toolbar';
    var CLASS_ACTIVE = 'active-player';
    var CLASS_NOT_ACTIVE = 'not-active-player';
    var CLASS_PLAYERS_FREEZE = 'players-freeze';
    var CLASS_PLAYERS_PLACEHOLDER = 'players-placeholder';

    var api;
    var business;
    var toolbarUi = $('.' + CLASS_TOOLBAR);
    var button = {
        restart: $('[name=restart]', toolbarUi),
        copy: $('[name=copy]', toolbarUi),
        next: $('#players', toolbarUi)
    };
    var currentPlayerPositionClass = '';

    var templates = {
        player: Handlebars.compile(document.getElementById('template-players').innerHTML)
    };
    var templatesPlaceholders = {
        player: $('#players')
    };
    var dom = {
        players: null,
        scorePlaceholder: $('#score'),
        score: null
    };

    function createPlayerUiId(id) {
        return 'player_' + id;
    }

    function createPlayerScoreUiId(player) {
        return 'player-score-' + player.id;
    }

    function listenPlayers() {
        var players = business.getPlayers();
        var activePlayer = business.getActivePlayer();
        var data = {
            players: players.map(function (player) {
                listenConquerDots(player);
                return {
                    id: createPlayerUiId(player.getId()),
                    name: player.getName(),
                    color: player.getColor(),
                    active: player === activePlayer
                }
            })
        };
        templatesPlaceholders.player.get(0).innerHTML = templates.player(data);
        dom.players = $('.player', templatesPlaceholders.player);
    }

    function listenChangeActivePlayer(activePlayer) {
        var newPlayerPositionClass = 'player-position-' + activePlayer.position;
        $('.' + CLASS_PLAYERS_PLACEHOLDER).removeClass(currentPlayerPositionClass).addClass(newPlayerPositionClass);
        currentPlayerPositionClass = newPlayerPositionClass;
    }

    function listenAddDot(dot) {
        if (business.canChangeActivePlayer()) {
            enableNextButton(true);
        }
    }

    function listenConquerDots(player) {
        updatePlayerScore(player, player.getTrappedDots().length);
    }

    function updatePlayerScore(player, score) {
        var playerScoreId = createPlayerScoreUiId(player);
        dom.score = $('.' + playerScoreId);
        dom.score.html(score);
        dom.scorePlaceholder.addClass(createPlayerScoreClassName(business.getPlayers()));
    }

    function createPlayerScoreClassName(players) {
        var className = 'player-score-';
        players.forEach(function(player, index) {
            className += player.id + (index < players.length - 1 ? '-': '');
        });
        return className;
    }

    function initEvents() {
        button.next.click(function () {
            //business.makeNextPlayerActive();
        });
    }

    function enableNextButton(state) {
        state = typeof(state) == 'boolean' ? state : true;
        console.info('Enable next button: ' + state);
    }

    function renderActivePlayer(player) {
        /*        var data = {
         id: createPlayerUiId(player.getId()),
         name: player.getName(),
         color: player.getColor(),
         active: true
         };
         templatesPlaceholders.player.html(templates.player({players: [data]}));
         dom.players = $('.player', templatesPlaceholders.player);*/
    }

    function init(module) {
        business = module;
        business.addListener(business.listen.change_active_player, listenChangeActivePlayer, true);
        business.addListener(business.listen.add_player, listenPlayers, true);
        business.addListener(business.listen.add_dot, listenAddDot, true);
        business.addListener(business.listen.conquer_dots, listenConquerDots, true);

        initEvents();
    }

    api = {
        init: init
    };
    return api;
});