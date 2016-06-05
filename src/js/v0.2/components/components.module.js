define([
	'angular',
	'./clientsList/components/clientsList.component',
	'./currentPlayer/components/currentPlayer.component',
	'./playerScore/components/playerScore.component',
	'./toolbar/components/toolbar.component'
], function(angular) {
	'use strict';

	angular.module('app', [
		'clientsList.module',
		'currentPlayer.module',
		'playerScore.module',
		'toolbar.module'
	]);
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['app']);
	});
});