function sortFunction(o1, o2) {
    var sum1 = Number('' + o1.x + o1.y);
    var sum2 = Number('' + o2.x + o2.y);
    if (sum1 > sum2) {
        return -1;
    } else if (sum1 < sum2) {
        return 1;
    }
    return 0;
}

function isUnsortedArraysEqual(expect, actual) {
    function isEqualToExpect(actualItem, index) {
        return actualItem.x === expect[index].x && actualItem.y === expect[index].y;
    }

    actual.sort(sortFunction);
    expect.sort(sortFunction);

    return actual.every(isEqualToExpect);
}

module.exports = {
    isUnsortedArraysEqual: isUnsortedArraysEqual
};
