const IOC = require('server/constants/ioc.constants');
const AUTH_CONFIG = require('application-configuration/auth');
var _ = require('lodash');
var fs = require('fs');
var ROOT_PATH = 'server';
var logger = require('server/logging/logger').create('IOC');

function normalizePath(directory) {
    return ROOT_PATH + '/' + directory;
}

function initializeIOCType(path, filePostfix) {
    var result = {};
    var files;
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (filePath) {
            var Class;
            var instance;
            var fileName;
            var relativeFilePath = path + '/' + filePath;
            var stats = fs.statSync(relativeFilePath);

            if (stats.isFile()) {
                if (filePath.endsWith(filePostfix)) {
                    fileName = filePath.replace(/\.js$/, '');
                    Class = require(relativeFilePath);
                    if (typeof Class.class === 'function') {
                        instance = new Class.class();
                        result[instance.getName()] = instance;
                    } else if (typeof Class.postConstructor === 'function') {
                        result[Class.getName()] = Class;
                    }
                    logger.info('\'%s\' was successfully initialized!', fileName);
                }
            } else if (stats.isDirectory()) {
                _.merge(result, initializeIOCType(relativeFilePath, filePostfix));
            }
        });
    }
    return result;
}

function initialize(wss, web) {
    var container = {};
    _.merge(container, initializeIOCType(normalizePath('auth'), '.auth.js'));
    _.merge(container, initializeIOCType(normalizePath('extension'), '.extension.js'));
    _.merge(container, initializeIOCType(normalizePath('controllers'), '.controller.js'));
    _.merge(container, initializeIOCType(normalizePath('services'), '.service.js'));
    _.merge(container, initializeIOCType(normalizePath('db'), '.manager.js'));
    _.merge(container, initializeIOCType(normalizePath('transmitters'), '.transmitter.js'));
    container[IOC.COMMON.WSS] = wss;
    container[IOC.COMMON.WEB] = web;
    container[IOC.COMMON.AUTH_CONFIG] = AUTH_CONFIG;
    return container;
}


module.exports = {
    initialize: initialize
};
