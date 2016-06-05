define([
	'angular',
	'module.game.business',
	'../clientsList.module'
], function(angular, Business) {
	'use strict';

	angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

	var vm,
		scope;

	function ClientsListController($scope) {
		vm = this;
		scope = $scope;
		vm.clientsList = [{id: 111111111111111111}];

		Business.addListener(Business.listen.add_client, listenPlayers, true);
	}

	function listenPlayers(pack) {
		vm.clientsList.push(pack);
		scope.$apply();
	}

});
