Dot = function () {
};

Dot.prototype.initilize = function (xIndex, yIndex) {
	this.xIndex_ = xIndex;
	this.yIndex_ = yIndex;
	return this;
};

Dot.prototype.updateState = function (teamId) {

};

Dot.prototype.getPosIndex = function() {
	return {
		x: this.xIndex_,
		y: this.yIndex_
	}
};

Dot.prototype.hasGraphics = function() {
	return !!this.graphics_;
};

Dot.prototype.getGraphics = function() {
	return this.graphics_;
};

Dot.prototype.setGraphics = function(graphics) {
	this.graphics_ = graphics;
	this.graphics_.setOwner(this);
	return this;
};
