var express = require('express');
var handlers = [
    {
        path: ['/'],
        fn: function (req, res) {
            res.sendFile(__dirname + '/src/views/index.html');
        }
    }
];

module.exports = {
    init: function (app) {
        app.use('/static', express.static(__dirname + '/src'));
        handlers.forEach(function (handler) {
            app.get(handler.path,
                handler.fn
            );
        });
        return this;
    }
};