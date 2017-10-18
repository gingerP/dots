'use strict';

const _ = require('lodash');
const events = require('./events');
const midllewares = require('./middlewares/websocket');

function initialize(wss, web) {
    var ioc = require('./initialize.ioc').initialize(wss, web);
    midllewares(ioc);
    _.forEach(ioc, postConstructor(ioc));
    handleNewConnections(wss);
}

function postConstructor(ioc) {
    return function (module) {
        if (typeof(module.postConstructor) === 'function') {
            module.postConstructor(ioc);
        }
    };
}

function eachEvents(eventsTree, callback) {
    for (let key in eventsTree) {
        if (eventsTree.hasOwnProperty(key)) {
            if (typeof eventsTree[key] === 'function') {
                callback(eventsTree[key]());
            } else {
                eachEvents(eventsTree[key], callback);
            }
        }
    }
}

function handleNewConnections(wss) {
    wss.addListener('new_connection', function (client) {
        eachEvents(events, function (event) {
            client.registerListeners(event);
        });
    });
}

module.exports = {
    initialize: initialize
};
