var Server;
var wsServer;
var server;
var WsServer;

global.req = require('app-root-path').require;
Server = require('./WebServer').class;
WsServer = require('./WSServer.IO');
server = new Server().init().start();
require('../controller-pages').init(server.app);
wsServer = WsServer.instance(server.server);
require('../src/back/app').initialize(wsServer);
