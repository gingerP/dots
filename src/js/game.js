require.config({
	baseUrl: "/static/js/v0.2/",
	paths: {
		'angular': './angularAMD',
		'storage': '../ext/basil.min',
		'local.storage': '../node_modules/lockr/lockr.min',
		'q': '../node_modules/q/q',
		'angularJs': '../node_modules/angular/angular.min',
		'lodash': '../node_modules/lodash/lodash.min',
		'i18n': './module.i18n',
		'react': '../ext/react-15.0.2',
		'reactDom': '../ext/react-dom-15.0.2',
		'd3': '../ext/d3.min',
		'jquery': '../ext/jquery-2.2.1.min',
		'observable': 'module.observable',
		'handlebars': '../ext/handlebars-v4.0.5',
		'socket': '../ext/socket.io-1.4.5',
		'engine.io': '../ext/engine.io',
		'module.game.business': './module.game.business',
		'module.game.graphics': './module.game.graphics',
		'module.game.player': './module.game.player',
		'module.game.toolbar': './module.game.toolbar',
		'module.game.players.list': './module.game.players.list',
		'module.transport': './module.transport',
		'module.game.player.history': './module.game.player.history',
		'module.graph': './module.graph',
		'module.observable': './module.observable',
		'module.backend.service': './module.backend.service',
		'module.storage': './module.storage',
		'beautify': '../ext/beautify',
	},
	shim: {
		'moduleGameBusiness': 'module.game.business'
	},
	waitSeconds: 15
});
require([
	'd3',
	'module.game.business',
	'module.game.graphics',
	'module.game.player',
	'module.game.player.history',
	'./components/components.module'
], function(d3, business, graphics, Player, History) {
	var pane = d3.select('#game-pane');
	var data = createData(40, 40, 2);
	var playerA = new Player().init('red', 'Red', '#df815a', 'red', new History());
	var playerB = new Player().init('blue', 'Blue', '#639bb4', 'blue', new History());
	business.init(business.modes.network, graphics, data, convertData(data)).addActivePlayers(playerA, playerB).makePlayerActive(playerA);
	graphics.init(pane, data, 40, 40).setBusiness(business);
});

function createData(width, height, radius) {
	var data = [];
	for (var w = 0; w < width; w++) {
		for (var h = 0; h < height; h++) {
			data.push({
				xInd  : w,
				yInd  : h,
				radius: radius,
				id: 'circle_' + w + '_' + h
			});
		}
	}
	return data;
}

function convertData(data) {
	var result = [];
	data.forEach(function(dataItem) {
		result[dataItem.xInd] = result[dataItem.xInd] || [];
		result[dataItem.xInd][dataItem.yInd] = dataItem;
	});
	return result;
}