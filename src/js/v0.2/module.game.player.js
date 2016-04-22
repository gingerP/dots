define([], function() {
    var Player = function() {};

    Player.prototype.init = function(id, name, color, history) {
        this.dots = [];
        this.trappedDots = [];
        this.losingDots = [];
        this.loops = [];
        this.id = id;
        this.name = name;
        this.color = color;
        this.history = history;
        return this;
    };

    Player.prototype.addDot = function(data) {
        //if (this.dots.indexOf(data) < 0) {
            this.dots.push(data);
        //}
        return this;
    };

    Player.prototype.addLoop = function(loop) {
        this.loops.push(loop);
        return this;
    };

    Player.prototype.getDots = function() {
        return this.dots;
    };

    Player.prototype.addTrappedDots = function(dots) {
        var inst = this;
        dots.forEach(function(dot) {
            if (inst.trappedDots.indexOf(dot) < 0) {
                inst.trappedDots.push(dot);
            }
        });
    };

    Player.prototype.addLosingDots = function(dots) {
        var selfDotIndex;
        var inst = this;
        dots.forEach(function(dot) {
            selfDotIndex = inst.dots.indexOf(dot);
            if (selfDotIndex > -1) {
                inst.dots.splice(selfDotIndex, 1);
            }
            if (inst.losingDots.indexOf(dot) < 0) {
                inst.losingDots.push(dot);
            }
        });
    };

    Player.prototype.hasDot = function(id) {
        return this.dots.indexOf(id) > -1;
    };

    Player.prototype.removeDot = function(id) {

    };

    Player.prototype.removeTrappedDot = function(id) {

    };

    Player.prototype.getColor = function() {
        return this.color;
    };

    Player.prototype.getId = function() {
        return this.id;
    };

    Player.prototype.getName = function() {
        return this.name;
    };

    return Player;
});