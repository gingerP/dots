define([
	'handlebars',
	'jquery'
], function(Handlebars, $) {
    'use strict';

	var api;
	var business;
	var container = $('#players-list');
	var placeholder = container.find('.players-list-placeholder');
	var template = {
		list: Handlebars.compile(document.getElementById('handlebars-users-list').innerHTML)
	}

	function listenPlayers(pack) {
		placeholder.html(template.list({clients: business.getClients()}));
	}

	function init() {
        business.addListener(business.listen.add_client, listenPlayers, true);
	}

	api = {
		init: function(_biusiness_) {
			business = _biusiness_;
			init();
		}

	}
	return api;
});