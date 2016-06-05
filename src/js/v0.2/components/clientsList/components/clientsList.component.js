define([
	'angular',
	'../clientsList.module',
	'../controllers/clientsList.controller'
], function(angular) {
	'use strict';

	angular.module('clientsList.module').component('clientsList', {
		bindings: {},
		controller: 'clientsListCtrl',
		controllerAs: 'clientsListCtrl',
		templateUrl: '/static/js/v0.2/components/clientsList/partials/clientsList.template.html'
	});
});
