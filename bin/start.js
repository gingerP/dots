var Server;
var wsServer;
var server;
var WsServer;
var configuration = require('../application-configuration/application');

//require('debug').enable('socket.io:*');
global.req = require('app-root-path').require;
Server = req('server/modules/WebServer').class;
WsServer = req('server/modules/WSServer.IO');
server = new Server(configuration).init().start();
req('server/controller-pages').init(server.app);
wsServer = WsServer.instance(server);
req('server/app').initialize(wsServer, server);
