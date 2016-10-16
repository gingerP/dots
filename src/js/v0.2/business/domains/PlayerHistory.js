define([
    'business/domains/PlayerHistoryRecord'
], function(HistoryRecord) {
    'use strict';

    var RECORD_ID_PREFIX = 'history_record';

    function PlayerHistory() {
        this.historyRecords = [];
    }

    PlayerHistory.prototype.addDot = function (data) {
        this.record.addDot(data);
        return this;
    };

    PlayerHistory.prototype.addTrappedDots = function () {
        this.record.addTrappedDots.apply(this.record, arguments);
        return this;
    };

    PlayerHistory.prototype.addLines = function () {
        this.record.addLines.apply(this.record, arguments);
        return this;
    };

    PlayerHistory.prototype.newRecord = function (prevRecordId) {
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

    PlayerHistory.prototype.hasDots = function () {
        return this.record ? this.record.hasDots() : false;
    };

    PlayerHistory.prototype.getId = function () {
        return this.record ? this.record.id : null;
    };

    PlayerHistory.prototype.getCurrentRecord = function () {
        return this.record;
    };
});
