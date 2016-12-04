var constants = require('./constants/constants');
var _ = require('lodash');
var fs = require('fs');
var ROOT_PATH = './server';
var logger = req('server/logging/logger').create('IOC');

function initializeIOCType(directory, filePostfix) {
    var result = {};
    var files = fs.readdirSync(ROOT_PATH + '/' + directory);
    files.forEach(function (filePath) {
        var Class;
        var instance;
        var fileName;
        if (filePath.endsWith(filePostfix)) {
            fileName = filePath.replace(/\.js$/, '');
            Class = req('server/' + directory + '/' + fileName).class;
            instance = new Class();
            result[instance.getName()] = instance;
            logger.info('\'%s\' was successfully initialized!', fileName);
        }
    });
    return result;
}

function initialize(wss, web) {
    var container = {};
    _.merge(container, initializeIOCType('extends', '.extend.js'));
    _.merge(container, initializeIOCType('controllers', '.controller.js'));
    _.merge(container, initializeIOCType('services', '.service.js'));
    _.merge(container, initializeIOCType('db', '.manager.js'));
    _.merge(container, initializeIOCType('transmitters', '.transmitter.js'));
    container[constants.WSS] = wss;
    container[constants.HTTP] = web;
    return container;
}


module.exports = {
    initialize: initialize
};