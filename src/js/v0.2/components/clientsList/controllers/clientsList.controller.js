define([
	'angular',
	'lodash',
	'components/constants/events.constant',
	'module.storage',
	'module.game.business',
	'module.backend.service',
	'components/clientsList/factories/clientsListUtil.factory',
	'components/clientsList/clientsList.module'
], function(angular, _, events, storage, Business, backend) {
	'use strict';

	angular.module('clientsList.module').controller('clientsListCtrl', ClientsListController);

	function ClientsListController($rootScope, $scope, clientsListUtilFactory) {
		var vm = this,
			myself;

		vm.clientsList = [];

		function listenPlayers(pack) {
			vm.clientsList.push(pack);
			$scope.$apply();
		}

		Business.addListener(Business.listen.add_client, listenPlayers, true);

		vm.invite = function invite(client) {
			Business.invite.ask(client._id).then(function() {

			}, function() {

			})
		};

		vm.submitInvite = function(toClient) {
			backend.emit.inviteSuccess(toClient._id);
		};

		vm.rejectInvite = function(toClient) {
			var client = _.find(vm.clientsList, {_id: toClient._id});
			client.mode = 'common';
			backend.emit.inviteReject(toClient._id);
		};

		backend.emit.getMyself().then(function(client) {
			myself = client;
		}).then(function() {
			return backend.emit.getClients();
		}).then(function(clients) {
			clients = _.map(clients, clientsListUtilFactory.prepareClientForUI);
			vm.clientsList = _.reject(clients, {_id: myself._id});
			$scope.$apply();
		});

		backend.listen.invitePlayer(function(message) {
			if (message.from) {
				clientsListUtilFactory.mergeInvite(message.from, vm.clientsList);
				$scope.$apply();
			}
		});

		backend.listen.inviteSuccessPlayer(function(message) {
			if (message.from) {
				clientsListUtilFactory.mergeInvite(message.from, vm.clientsList);
				$scope.$apply();
			}
		});

		backend.listen.inviteRejectPlayer(function(message) {
			if (message.to) {
				clientsListUtilFactory.mergeReject(message.to, vm.clientsList);
				$scope.$apply();
			}
		});

	}

});
