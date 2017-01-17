function sortFunction(o1, o2) {
    if (o1.x > o2.x || o1.x === o2.x && o1.y > o2.y) {
        return -1;
    } else if (o1.x < o2.x || o1.x === o2.x && o1.y < o2.y) {
        return 1;
    }
    return 0;
}

function isUnsortedArraysEqual(expect, actual) {
    function isEqualToExpect(actualItem, index) {
        var result = actualItem.x === expect[index].x && actualItem.y === expect[index].y;
        return result;
    }

    actual.sort(sortFunction);
    expect.sort(sortFunction);

    return actual.every(isEqualToExpect);
}

module.exports = {
    isUnsortedArraysEqual: isUnsortedArraysEqual
};
