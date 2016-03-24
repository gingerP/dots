require.config({
	baseUrl: "/static/js/v0.2/",
	paths: {
		'd3': '../ext/d3.min',
		'jquery': '../ext/jquery-2.2.1.min'
	},
	waitSeconds: 15
});
require([
	'd3',
	'module.game.business',
	'module.game.graphics'
], function(d3, business, graphics) {
	var pane = d3.select('#game-pane');
	var data = createData(40, 40, 2);
	business.init(graphics);
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