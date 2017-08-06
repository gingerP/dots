var Server;
var wsServer;
var server;
var WsServer;
var configuration = require('../config/config');
var path = require('path');

//require('debug').enable('socket.io:*');
require('app-module-path').addPath(path.resolve(__dirname, '../'));
Server = require('server/modules/WebServer').class;
WsServer = require('server/modules/WSServer.IO');
server = new Server(configuration).init().start();
require('server/controller-pages').init(server.app);
wsServer = WsServer.instance(server);
require('server/app').initialize(wsServer, server);
