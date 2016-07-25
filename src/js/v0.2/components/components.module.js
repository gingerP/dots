define([
	'angular',
	'./game/components/game.component',
	'./clientsList/components/clientsList.component',
	'./currentPlayer/components/currentPlayer.component',
	'./playerScore/components/playerScore.component',
	'./toolbar/components/toolbar.component',
	'./accordion/components/accordion.component',
	'./invitesList/components/invites.list.component'
], function(angular) {
	'use strict';

	angular.module('app', [
		'game.module',
		'clientsList.module',
		'currentPlayer.module',
		'playerScore.module',
		'toolbar.module',
		'accordion.module',
		'invites.list.module'
	]);
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['app']);
	});
});