define([
    'lodash',
    'services/business/domains/PlayerHistoryRecord',
    'utils/common-utils',
    'services/business/domains/NetworkStatus'
], function (_, Step, CommonUtils, NetworkStatus) {
    'use strict';

    function Player() {
    }

    Player.prototype.init = function (client) {
        this.dots = [];
        this.trappedDots = [];
        this.losingDots = [];
        this.loops = [];
        this.id = client.id || client._id;
        this.icon = client.icon;
        this.name = client.name;
        this.color = client.color;
        this.style = client.style;
        this.auth = client.auth;
        this.isActive = false;
        this.isOnline = _.isUndefined(client.networkStatus) || NetworkStatus.ONLINE;
        return this;
    };

    Player.prototype.merge = function merge(client) {
        this.id = client.id || client._id;
        this.name = client.name;
        this.color = client.color ? client.color : this.color;
        this.style = client.style;
        this.auth = client.auth;
        this.icon = client.icon;
        return this;
    };

    Player.prototype.updateActive = function (isActive) {
        this.isActive = isActive;
        return this;
    };

    Player.prototype.addDots = function (dots) {
        var prepareDots = CommonUtils.createArray(dots);
        this.dots = this.dots.concat(prepareDots);
        return this;
    };

    Player.prototype.selectDot = function (data) {
        this.dots.push(data);
        this.step.addDot(data);
        return this;
    };

    Player.prototype.addLoops = function (loops) {
        var preparedLoops = CommonUtils.createArray(loops);
        this.loops = this.loops.concat(preparedLoops);
        return this;
    };

    Player.prototype.getDots = function () {
        return this.dots;
    };

    Player.prototype.getTrappedDots = function () {
        return this.trappedDots;
    };

    Player.prototype.addTrappedDots = function (dots) {
        var preparedDots = CommonUtils.createArray(dots);
        this.trappedDots = this.trappedDots.concat(preparedDots);
        return this;
    };

    Player.prototype.addLosingDots = function (dots) {
        var selfDotIndex;
        var inst = this;
        dots.forEach(function (dot) {
            selfDotIndex = inst.dots.indexOf(dot);
            if (selfDotIndex > -1) {
                inst.dots.splice(selfDotIndex, 1);
            }
            if (inst.losingDots.indexOf(dot) < 0) {
                inst.losingDots.push(dot);
            }
        });
        return this;
    };

    Player.prototype.hasDot = function (data) {
        return _.findIndex(this.dots, {x: data.x, y: data.y}) > -1;
    };

    Player.prototype.hasStepDot = function () {
        return this.step.hasDots();
    };

    Player.prototype.newStep = function () {
        this.step = new Step();
        return this;
    };

    Player.prototype.getColor = function () {
        return this.color;
    };

    Player.prototype.setStyle = function (style) {
        this.style = style;
    };

    Player.prototype.getStyle = function () {
        return this.style;
    };

    Player.prototype.getId = function () {
        return this.id;
    };

    Player.prototype.getName = function () {
        return this.name;
    };

    return Player;
});
