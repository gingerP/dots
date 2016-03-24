GameManager = function () {
};

GameManager.prototype.initilize = function (graphicsManager, cfg) {
	this.graphicsManager_ = graphicsManager;
	this.graphicsManager_.setOwner(this);
	this.dots = [];
	this.cfg_ = {
		size: {
			xNum: 10,
			yNum: 10
		}
	};
	$.extend(true, this.cfg_, cfg);
	this.initDots_();
	return this;
};

GameManager.prototype.addTeams = function () {

	return this;
};

GameManager.prototype.isDotBusy = function (posX, posY) {

};

GameManager.prototype.getDotTeam = function (posX, posY) {

};

GameManager.prototype.initDots_ = function () {
	var xIndex = 0;
	var yIndex = 0;
	for (xIndex = 0; xIndex < this.cfg_.size.xNum; xIndex++) {
		for (yIndex = 0; yIndex < this.cfg_.size.yNum; yIndex++) {
			this.dots.push(new Dot().initilize(xIndex, yIndex));
		}
	}
};

GameManager.prototype.getDots = function () {
	return this.dots;
};