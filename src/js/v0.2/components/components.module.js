define([
    'angular',
    'components/game/components/game.component',
    'components/clientsList/components/clientsList.component',
    'components/currentPlayer/components/currentPlayer.component',
    'components/playerScore/components/playerScore.component',
    'components/toolbar/components/toolbar.component',
    'components/accordion/components/accordion.component',
    'components/invitesList/components/invites.list.component',
    'components/notification/notification.module',
    'components/playerMenu/components/playerMenu.component',
    'components/gamePane/components/gamePane.component',
    'components/playerColor/components/playerColor.component',
    'components/utils/common.helpers.module'
], function (angular) {
    'use strict';

    angular.module('app', [
        'game.module',
        'clientsList.module',
        'currentPlayer.module',
        'playerScore.module',
        'toolbar.module',
        'accordion.module',
        'invites.list.module',
        'notification.module',
        'player.menu.module',
        'gamePane.module',
        'playerColor.module',
        'common.helpers.module'
    ]);
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
    });
});
