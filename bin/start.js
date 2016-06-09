global._req = require('app-root-path').require;
var Server = require('./WebServer').class;
var WsServer = require('./WSServer.IO');
var server = new Server().init().start();
require('../controller-pages').init(server.app);
var wsServer = WsServer.instance(server.server);
var MessageBroker = _req('/src/back/modules/Business').init(wsServer);
