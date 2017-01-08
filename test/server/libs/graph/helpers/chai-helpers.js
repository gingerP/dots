'use strict';
var chai = require('chai');

function defaultCheck(expect, actual) {
    if (!actual || !expect) {
        throw 'Actual and Expected values should be an arrays!';
    }
    if (actual.length !== expect.length) {
        throw 'Actual and Expected arrays sizes should be equal!';
    }
}

function sortFunction(o1, o2) {
    var sum1 = Number('' + o1.x + o1.y);
    var sum2 = Number('' + o2.x + o2.y);
    if (sum1 > sum2) {
        return -1;
    } else if (sum1 < sum2) {
        return 1;
    } else {
        return 0;
    }
}


function deepUnsortedArrayEqual(expect, actual) {
    function isEqualToExpect(actualItem, index) {
        return actualItem.x === expect[index].x && actualItem.y === expect[index].y;
    }
    defaultCheck(expect, actual);


    actual.sort(sortFunction);
    expect.sort(sortFunction);

    if (!actual.every(isEqualToExpect)) {
        throw 'Actual are NOT equal to Expected';
    }

    return true;
}

function equalLoopData(expected, equal) {

}

chai.Assertion.addMethod('deepUnsortedArrayEqual', function (expect) {
    try {
        deepUnsortedArrayEqual(expect, this._obj, '/');
    }
    catch (msg) {
        this.assert(false, msg, undefined, expect, this._obj);
    }
});

chai.Assertion.addMethod('equalLoopData', function (expect) {
    try {
        equalLoopData(expect, this._obj, '/');
    }
    catch (msg) {
        this.assert(false, msg, undefined, expect, this._obj);
    }
});

module.exports = chai;
