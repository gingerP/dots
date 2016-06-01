require.config({
	baseUrl: "/static/js/v0.2/",
	paths: {
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
		'module.game.transport': './module.game.transport',
		'module.game.player.history': './module.game.player.history',
		'module.graph': './module.graph',
		'module.observable': './module.observable',
		'beautify': '../ext/beautify'
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
	'module.game.toolbar',
	'module.game.players.list',
	'module.game.player.history',
	'../ext/ace/ace/ace',
	'./module.ui.components'
], function(d3, business, graphics, Player, toolbar, playersList, History) {
	var pane = d3.select('#game-pane');
	var data = createData(40, 40, 2);
	var playerA = new Player().init('red', 'Red', '#df815a', new History());
	var playerB = new Player().init('blue', 'Blue', '#639bb4', new History());
	toolbar.init(business);
	playersList.init(business);
	business.init(business.modes.network, graphics, data, convertData(data)).addPlayers(playerA, playerB).makePlayerActive(playerA);
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