document.addEventListener('DOMContentLoaded', function () {
	initializeGamePane('#game-pane');

}, false);

function initializeGamePane(selector) {

	var redTeamGraphics = new DotsTeamGraphics().initilize('red', 'red');
	var redTeam = new DotsTeam().initialize('red', redTeamGraphics);

	var blueTeamGraphics = new DotsTeamGraphics().initilize('blue', 'blue');
	var blueTeam = new DotsTeam().initialize('blue', blueTeamGraphics);

	var gameGraphicsManager = new GameGraphicsManager().initilize({
		canvasSelector: selector,
		size: {
			xNum: 10,
			yNum: 10,
			width : 500,
			height: 500
		},
		dotSize: {
			width: 20,
			height: 20
		},
		animation: 'poor'
	}).addTeams(redTeamGraphics, blueTeamGraphics);
	var gameManager = new GameManager().initilize(
		gameGraphicsManager, {
			size: {
				xNum: 10,
				yNum: 10
			}
		}).addTeams(redTeam, blueTeam);


	gameGraphicsManager.render();

}

