require.config({
	baseUrl: "/static/js/v0.2/",
	paths: {
		'd3': '../ext/d3.min',
		'jquery': '../ext/jquery-2.2.1.min',
		'observable': 'module.observable',
		'handlebars': '../ext/handlebars-v4.0.5',
		'socket': '../ext/socket.io-1.4.5',
		'engine.io': '../ext/engine.io'
	},
	waitSeconds: 15
});
require([
	'd3',
	'module.game.business',
	'module.game.graphics',
	'module.game.player',
	'module.game.toolbar',
	'module.game.transport',
	'module.game.player.history',
	'module.graph'
], function(d3, business, graphics, Player, toolbar, transport, History) {
	var pane = d3.select('#game-pane');
	var data = createData(40, 40, 2);
	var playerA = new Player().init('red', 'Red', 'red', new History());
	var playerB = new Player().init('blue', 'Blue', 'blue', new History());
	toolbar.init(business);
	business.init(business.modes.local, graphics, data, convertData(data)).addPlayers(playerA, playerB).makePlayerActive(playerA);
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