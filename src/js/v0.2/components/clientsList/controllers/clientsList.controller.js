define([
	'angular',
	'lodash',
	'module.game.business',
	'module.backend.service',
	'../clientsList.module'
], function(angular, _, Business, Service) {
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
			Business.invite.ask(client.id).then(function() {

			}, function() {

			})
		};

		Service.emit.getMyself().then(function(client) {
			myself = client;
		}).then(function() {
			return Service.emit.getClients();
		}).then(function(clients) {
			vm.clientsList = _.reject(clients, {connection_id: myself.connection_id});
			$scope.$apply();
		});
	}

	function listenPlayers(pack) {
		vm.clientsList.push(pack);
		scope.$apply();
	}

});
