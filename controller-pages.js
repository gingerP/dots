var express = require('express');
var handlers = [
    {
        path: ['/'],
        fn: function (req, res) {
            console.log('Request: ' + req.path);
            res.sendFile(__dirname + '/src/views/index.html');
        }
    }
];

module.exports = {
    init: function (app) {
        app.use('/static', express.static(__dirname + '/build'));
        app.use('/static/js/node_modules', express.static(__dirname + '/node_modules'));
        handlers.forEach(function (handler) {
            app.get(handler.path,
                handler.fn
            );
        });
        return this;
    }
};
