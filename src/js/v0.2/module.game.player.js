define([], function() {
    var Player = function() {};

    Player.prototype.init = function(id, name, color, history) {
        this.dots = [];
        this.trappedDots = [];
        this.id = id;
        this.name = name;
        this.color = color;
        this.history = history;
        return this;
    };

    Player.prototype.addDot = function(id) {
        if (this.dots.indexOf(id) < 0) {
            this.dots.push(id);
        }
    };

    Player.prototype.getDots = function() {
        return this.dots;
    };

    Player.prototype.addTrappedDot = function(id) {
        if (this.trappedDots.indexOf(id) < 0) {
            this.trappedDots.push(id);
        }
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