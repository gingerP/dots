global._req = require('app-root-path').require;
var Server = require('./WebServer').class;
var WsServer = require('./WSServer');
var server = new Server().init().start();
require('../controller-pages').init(server.app);
var wsServer = WsServer.instance(server.server);
