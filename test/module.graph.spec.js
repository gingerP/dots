var ModuleGraph = require('../src/js/v0.2/module.graph');
function convertToVertexes(data) {
    var result = [];
    data.forEach(function(str, y) {
        var x = 0;
        while(x < str.length) {
            if (str[x] == 'x') {
                result.push({
                    x: x,
                    y: y
                });
            }
        }
    });
    return result;
}

var tests = ;
