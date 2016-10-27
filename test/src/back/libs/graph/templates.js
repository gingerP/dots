'use strict';

var fs = require('fs');
var xSizeApproved = 0;
var ySizeApproved = 0;
var template;
var array = [];

function run() {
    var fileName;
    if (process.argv.length > 3) {
        template = process.argv[2];
        xSizeApproved = process.argv[3];
        ySizeApproved = process.argv[4];
        fileName = Date.now() + '.json';
        generate();
        fs.writeFile(fileName, JSON.stringify({
            inbound: convertArray(array)
        }), function () {
            console.info('File ' + fileName);
        });
    } else {
        console.error('Invalid arguments');
    }
}

function generate() {
    array = updateArray(xSizeApproved, ySizeApproved);
    if (template === 'spiral') {
        makeSpiral();
    } else if (template === 'grid') {
        /**/
    }
}

function convertArray(list) {
    var xIndex = 0;
    var yIndex = 0;
    var result = [];
    for (; xIndex < list.length; xIndex++) {
        for (yIndex = 0; yIndex < list[xIndex].length; yIndex++) {
            if (list[xIndex][yIndex].isSelected) {
                result.push({
                    x: list[xIndex][yIndex].x,
                    y: list[xIndex][yIndex].y
                });
            }
        }
    }
    return result;
}

function updateArray(x, y) {
    var xIndex = 0;
    var yIndex = 0;
    var result = [];
    for (; xIndex < x; xIndex++) {
        result.push([]);
        for (yIndex = 0; yIndex < y; yIndex++) {
            result[xIndex].push({x: xIndex, y: yIndex});
        }
    }
    return result;
}

function makeSpiral() {
    var xSize = xSizeApproved;
    var step = 2;
    var index = 0;
    var line = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    };
    var lineSize = step + 1;

    while (lineSize > step) {
        lineSize = getLineSize(index, xSize);
        line = getSpiralLine(index, line.x2, line.y2, xSize);
        selectLine(line);
        index++;
    }
    selectLine({x1: 2, y1: 1, x2: 2, y2: 1});
}

function getLineSize(index, arrayHeight) {
    var stepIndex = Math.floor(index / 2);
    var stepSize = 2;
    return arrayHeight - stepIndex * stepSize;
}

function getSpiralLine(index, x2, y2, arrayHeight) {
    var position = index - (Math.floor(index / 4) * 4);
    var lineSize = getLineSize(index, arrayHeight);
    if (position === 0) {
        return {x1: x2, y1: y2, x2: x2 + (lineSize - 1), y2: y2};
    } else if (position === 1) {
        return {x1: x2, y1: y2, x2: x2, y2: y2 + (lineSize - 1)};
    } else if (position === 2) {
        return {x1: x2, y1: y2, x2: x2 - (lineSize - 1), y2: y2};
    } else if (position === 3) {
        return {x1: x2, y1: y2, x2: x2, y2: y2 - (lineSize - 1)};
    }
    return {};
}

function selectLine(pos) {
    var index = 0;
    if (pos.x1 === pos.x2) {
        if (pos.y1 < pos.y2) {
            for (index = pos.y1; index <= pos.y2; index++) {
                array[pos.x1][index].isSelected = true;
            }
        } else {
            for (index = pos.y1; index >= pos.y2; index--) {
                array[pos.x1][index].isSelected = true;
            }
        }
    } else if (pos.y1 === pos.y2) {
        if (pos.x1 < pos.x2) {
            for (index = pos.x1; index <= pos.x2; index++) {
                array[index][pos.y1].isSelected = true;
            }
        } else {
            for (index = pos.x1; index >= pos.x2; index--) {
                array[index][pos.y1].isSelected = true;
            }
        }
    }
}

run();

