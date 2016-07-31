define([
	'angular',
	'components/utils/scope.utils',
	'../clientsList.module',
	'../controllers/clientsList.controller'
], function(angular, scopeUtils) {
	'use strict';

	angular.module('clientsList.module').directive('clientsList', clientsList);

	function clientsList() {

		function linkFunction(scope, element) {

			function handleReject(client) {

			}

		}

		return {
			scope: {},
			controller: 'clientsListCtrl',
			controllerAs: 'clientsListCtrl',
			templateUrl: '/static/js/v0.2/components/clientsList/partials/clientsList.template.html',
			link: linkFunction
		};
	}
});
