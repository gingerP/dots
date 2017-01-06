'use strict';
const fs = require('fs');
const _ = require('lodash');

function isDirectoryAllowed(directoryName, directoriesInclude, directoriesExclude) {
    var isInclude = !directoriesInclude || Boolean(directoriesInclude.length) || directoriesInclude.indexOf(directoryName) > -1;

    if (isInclude) {
        isInclude = !directoriesExclude || !directoriesExclude.length || directoriesExclude.indexOf(directoryName) < 0;
    }
    return isInclude;
}

function getFiles(directory, directoriesInclude, directoriesExclude) {
    var results = [];

    (function walk(dir) {
        var files = fs.readdirSync(dir);
        _.forEach(files, function (file) {
            var fileName = dir + '/' + file;
            var stat = fs.statSync(fileName);
            if (stat && stat.isDirectory()) {
                if (!isDirectoryAllowed(file, directoriesInclude, directoriesExclude)){
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
