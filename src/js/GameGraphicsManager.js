GameGraphicsManager = function () {
};

GameGraphicsManager.prototype.initilize = function (cfg) {
	this.cfg_ = {
		size     : {
			xNum  : 10,
			yNum  : 10,
			width : 100,
			height: 100
		},
		dotSize  : {
			width : 10,
			height: 10
		},
		animation: 'poor'
	};
	$.extend(true, this.cfg_, cfg);
	this.getCanvas();
	this.initFindCriteria_();
	return this;
};

GameGraphicsManager.prototype.addTeams = function () {

	return this;
};

GameGraphicsManager.prototype.render = function () {
	this.renderTable_();
	this.renderDots_();
};

GameGraphicsManager.prototype.getCanvas = function () {
	if (!this.context_) {
		this.context_ = document.querySelector(this.cfg_.canvasSelector);
		if (this.context_) {
			this.context_.setAttribute('width', this.cfg_.size.width);
			this.context_.setAttribute('height', this.cfg_.size.height);
			this.context_ = new fabric.Canvas(this.context_);
		}
	}
	return this.context_;
};

GameGraphicsManager.prototype.renderTable_ = function () {

};

GameGraphicsManager.prototype.renderDots_ = function () {
	var inst = this;
	var dots = this.owner_.getDots();
	dots.forEach(function (dot) {
		if (!dot.hasGraphics()) {
			dot.setGraphics(new DotGraphics().initilize(inst.context_, {
				width : inst.cfg_.dotSize.width,
				height: inst.cfg_.dotSize.height
			}));
		}
		dot.getGraphics().render();
	});
	this.initEvents_();
	return this;
};

GameGraphicsManager.prototype.initEvents_ = function () {
	var inst = this;
	this.context_.on('mouse:over', function (event) {
		var dot = inst.findDot({contain: event.target});
		if (dot) {
			dot.getGraphics().hoverIn();
		}
	});
	
	this.context_.on('mouse:out', function (event) {
		var dot = inst.findDot({contain: event.target});
		if (dot) {
			dot.getGraphics().hoverOut();
		}
	});
};

GameGraphicsManager.prototype.findDot = function (params) {
	var result;
	var criteria;
	if (params) {
		criteria = this.getFindCriteria_(params);
		this.owner_.getDots().every(function(dot) {
			var res = criteria(dot, params);
			if (res) {
				result = dot;
			}
			return !res;
		});
	}
	return result;
};

GameGraphicsManager.prototype.getFindCriteria_ = function(params) {
	if (params.circle) {
		return this.findCriteria.circle;
	} else if (params.contain) {
		return this.findCriteria.contain;
	}
};

GameGraphicsManager.prototype.initFindCriteria_ = function() {
	this.findCriteria = {
		circle: function (dot, params) {
			return dot.getGraphics().getCircle() === params.circle;
		},
		contain: function(dot, params) {
			return dot.getGraphics().contain(params.contain);
		}
	};
};

GameGraphicsManager.prototype.setOwner = function (owner) {
	this.owner_ = owner;
	return this;
};
