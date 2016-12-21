var Server;
var wsServer;
var server;
var WsServer;
var configuration = require('../application-configuration/application');

debug = require('debug').enable('socket.io:server');
global.req = require('app-root-path').require;
Server = req('server/modules/WebServer').class;
WsServer = req('server/modules/WSServer.IO');
server = new Server(configuration).init().start();
req('controller-pages').init(server.app);
wsServer = WsServer.instance(server.server);
req('server/app').initialize(wsServer, server);
