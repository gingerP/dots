'use strict';
const fs = require('fs');
const _ = require('lodash');

function isDirectoryAllowed(directoryName, directoriesInclude) {
    if (directoriesInclude && (!directoriesInclude.length || directoriesInclude.indexOf(directoryName) < 0)) {
        return false;
    }
    return !directoriesInclude || directoriesInclude.indexOf(directoryName) > -1;
}

function getFiles(directory, directoriesInclude) {
    var results = [];

    (function walk(dir) {
        var files = fs.readdirSync(dir);
        _.forEach(files, function (file) {
            var fileName = dir + '/' + file;
            var stat = fs.statSync(fileName);
            if (stat && stat.isDirectory()) {
                if (!isDirectoryAllowed(file, directoriesInclude)){
                    return;
                }
                walk(fileName);
            } else {
                results.push(fileName);
            }
        });
    })(directory);

    return results;
}

module.exports = {
    getFiles: getFiles
};
