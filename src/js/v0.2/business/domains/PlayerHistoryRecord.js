define([
    'lodash',
    'utils/common-utils'
], function(_, commonUtils) {
    'use strict';

    var RECORD_ID_PREFIX = 'history_record';

    function HistoryRecord () {
        this.id = RECORD_ID_PREFIX + '_' + commonUtils.getRandomString() + '_' + Date.now();
        this.startTimeStamp = Date.now();
        this.dots = [];
        this.trappedDots = [];
        this.lines = [];
        this.isAlien = false;
    }

    HistoryRecord.prototype.addDot = function(data) {
        var dot = {};
        _.assignIn(true, dot, data);
        this.dots.push(dot);
        return this;
    };

    HistoryRecord.prototype.addTrappedDots = function() {
        var inst = this;
        _.forEach(arguments, function(index, dot_) {
            var dot = {};
            _.assignIn(dot, dot_);
            inst.trappedDots.push(dot);
        });
        return this;
    };

    HistoryRecord.prototype.addLines = function() {
        var inst = this;
        _.forEach(arguments, function(pair) {
            var start = {};
            var finish = {};
            _.assignIn(start, pair[0]);
            _.assignIn(finish, pair[1]);
            inst.lines.push([start, finish]);
        });
        return this;
    };

    HistoryRecord.prototype.hasDots = function() {
        return Boolean(this.dots.length);
    };

    HistoryRecord.prototype.hasTrappedDots = function() {
        return Boolean(this.trappedDots.length);
    };

    HistoryRecord.prototype.stamp = function() {
        this.finishTimeStamp = Date.now();
        return this;
    };

    return HistoryRecord;
});
