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

		vm.invite = function invite(client) {
			Business.invitePlayer(client).then(function() {

			}, function() {

			})
		}
	}

	function listenPlayers(pack) {
		vm.clientsList.push(pack);
		scope.$apply();
	}

});
