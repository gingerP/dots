DotGraphics = function () {
};

DotGraphics.prototype.initilize = function (context, cfg) {
	this.context_ = context;
	this.cfg_ = {};
	$.extend(true, this.cfg_, cfg);
	return this;
};

DotGraphics.prototype.render = function () {
	this.createDot_();
	this.initOptions_();
	this.initAnimation_();
	this.context_.add(this.circle);
};

DotGraphics.prototype.setOwner = function (owner) {
	this.owner_ = owner;
	return this;
};

DotGraphics.prototype.getCircle = function() {
	return this.circle;
};

DotGraphics.prototype.getRect_ = function (indexes) {
	return {
		x      : indexes.x * this.cfg_.width,
		y      : indexes.y * this.cfg_.height,
		width  : this.cfg_.width,
		height : this.cfg_.height,
		centerX: (indexes.x + 0.5) * this.cfg_.width,
		centerY: (indexes.y + 0.5) * this.cfg_.height
	}
};

DotGraphics.prototype.initOptions_ = function () {
	this.circle.lockScalingFlip = true;
	this.circle.lockMovementX = true;
	this.circle.lockMovementY = true;
	this.circle.lockScalingX = true;
	this.circle.lockScalingY = true;
	this.circle.selectable = false;
	
	this.hoverCircle.lockScalingFlip = true;
	this.hoverCircle.lockMovementX = true;
	this.hoverCircle.lockMovementY = true;
	this.hoverCircle.lockScalingX = true;
	this.hoverCircle.lockScalingY = true;
	this.hoverCircle.selectable = false;	
	this.isHover_ = false;
};

DotGraphics.prototype.hoverIn = function() {
	this.circle.animate('scaleY', '1.5', {
		onChange: this.context_.renderAll.bind(this.context_),
		duration: 100
	});
	this.circle.animate('scaleX', '1.5', {
		onChange: this.context_.renderAll.bind(this.context_),
		duration: 100
	});
};

DotGraphics.prototype.hoverOut = function() {
	this.circle.animate('scaleY', '1', {
		onChange: this.context_.renderAll.bind(this.context_),
		duration: 100
	});
	this.circle.animate('scaleX', '1', {
		onChange: this.context_.renderAll.bind(this.context_),
		duration: 100
	});
};

DotGraphics.prototype.contain = function(fabricObj) {
	return fabricObj === this.circle;
};

DotGraphics.prototype.createDot_ = function() {
	var indexes = this.owner_.getPosIndex();
	var rect = this.getRect_(indexes);
	var radius = 3;
	var offSet = (this.cfg_.width / 2) - radius;
	this.circle = new fabric.Circle({
		radius: radius,
		fill  : '#66AABB',
		left  : rect.x + offSet,
		top   : rect.y + offSet,
		originX: "center",
		originY: "center"
	});

	this.hoverCircle = new fabric.Circle({
		radius: radius + 2,
		//fill  : '#66AABB',
		left  : rect.x + offSet - 2,
		top   : rect.y + offSet - 2
	});

/*	this.group = new fabric.Group([this.circle, text ], {
		left: 150,
		top: 100,
		angle: -10
	});*/
};

DotGraphics.prototype.initAnimation_ = function () {
	var inst = this;

};