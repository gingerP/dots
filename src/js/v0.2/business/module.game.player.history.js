define([
    'jquery',
    'utils/common-utils'
], function($, commonUtils) {
    'use strict';

    var RECORD_ID_PREFIX = 'history_record';

    function PlayerHistory() {
        this.historyRecords = [];
    }

    PlayerHistory.prototype.addDot = function(data) {
        this.record.addDot(data);
        return this;
    };

    PlayerHistory.prototype.addTrappedDots = function() {
        this.record.addTrappedDots.apply(this.record, arguments);
        return this;
    };

    PlayerHistory.prototype.addLines = function() {
        this.record.addLines.apply(this.record, arguments);
        return this;
    };

    PlayerHistory.prototype.newRecord = function(prevRecordId) {
        if (this.record) {
            this.record.stamp();
            this.record = new HistoryRecord();
            this.historyRecords.push(this.record);
            this.record.id = prevRecordId;
            this.record.isAlien = true;
            this.record.stamp();
        }
        this.record = new HistoryRecord();
        this.historyRecords.push(this.record);
        return this;
    };

    PlayerHistory.prototype.hasDots = function() {
        return this.record.hasDots();
    };

    PlayerHistory.prototype.getId = function() {
        return this.record.id;
    };

    PlayerHistory.prototype.getCurrentRecord = function() {
        return this.record;
    };

    /***********************************************************************/

    var HistoryRecord = function() {
        this.id = RECORD_ID_PREFIX + '_' + commonUtils.getRandomString() + '_' + Date.now();
        this.startTimeStamp = Date.now();
        this.finishTimeStamp;
        this.dots = [];
        this.trappedDots = [];
        this.lines = [];
        this.isAlien = false;
    };

    HistoryRecord.prototype.addDot = function(data) {
        var dot = {};
        $.extend(true, dot, data);
        this.dots.push(dot);
        return this;
    };

    HistoryRecord.prototype.addTrappedDots = function() {
        var dot = {};
        var inst = this;
        $.each(arguments, function(index, dot_) {
            var dot = {};
            $.extend(true, dot, dot_);
            inst.trappedDots.push(dot);
        });
        return this;
    };

    /**
     * argumets, example: [[data1, data2], [data2, data3], [data3, data1]]
     * @returns {HistoryRecord}
     */
    HistoryRecord.prototype.addLines = function() {
        var dot = {};
        var inst = this;
        $.each(arguments, function(index, pair) {
            var start = {};
            var finish = {};
            $.extend(true, start, pair[0]);
            $.extend(true, finish, pair[1]);
            inst.lines.push([start, finish]);
        });
        return this;
    };

    HistoryRecord.prototype.hasDots = function() {
        return !!this.dots.length;
    };

    HistoryRecord.prototype.hasTrappedDots = function() {
        return !!this.trappedDots.length;
    };

    HistoryRecord.prototype.stamp = function() {
        this.finishTimeStamp = Date.now();
        return this;
    };


    return PlayerHistory;
});