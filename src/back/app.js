var _ = require('lodash');
var events = require('./events');
function initialize(wss) {
    var ioc = require('./initialize.ioc').initialize(wss);
    _.forEach(ioc, postConstructor(ioc));
    handleNewConnections(wss);
}

function postConstructor(ioc) {
    return function(module) {
        if (typeof(module.postConstructor) === 'function') {
            module.postConstructor(ioc);
        }
    }
}

function handleNewConnections(wss) {
    wss.addListener('new_connection', function(client) {
        _.forEach(events, function(event) {
            client.registerListeners(event);
        });
    });
}

module.exports = {
    initialize: initialize
};