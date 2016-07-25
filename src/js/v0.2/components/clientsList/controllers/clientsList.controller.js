define([
	'angular',
	'lodash',
	'module.game.business',
	'module.backend.service',
	'../clientsList.module'
], function(angular, _, Business, backend) {
	'use strict';

	angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

	var vm,
		scope,
		myself;

	function ClientsListController($scope) {
		vm = this;
		scope = $scope;
		vm.clientsList = [];

		Business.addListener(Business.listen.add_client, listenPlayers, true);

		vm.invite = function invite(client) {
			Business.invite.ask(client._id).then(function() {

			}, function() {

			})
		};

		backend.emit.getMyself().then(function(client) {
			myself = client;
		}).then(function() {
			return backend.emit.getClients();
		}).then(function(clients) {
			vm.clientsList = _.reject(clients, {_id: myself._id});
			$scope.$apply();
		});
	}

	function listenPlayers(pack) {
		vm.clientsList.push(pack);
		scope.$apply();
	}

});
