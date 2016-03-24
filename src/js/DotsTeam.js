DotsTeam = function () {
};

DotsTeam.prototype.initialize = function (teamId, color) {
	this.teamId_ = teamId;
	this.color_ = color;
	this.dots = [];

	return this;
};

DotsTeam.prototype.getTeamId = function () {
	return this.teamId_;
};

DotsTeam.prototype.getColor = function () {
	return this.color_;
};

DotsTeam.prototype.addDot = function (dot) {

};