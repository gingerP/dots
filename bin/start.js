global._req = require('app-root-path').require;
var Server = require('./WebServer').class;
var WsServer = require('./WSServer.IO');
var server = new Server().init().start();
require('../controller-pages').init(server.app);
var wsServer = WsServer.instance(server.server);
//-------------Controllers
//var CreateGameController = require('../src/back/controllers/createGame.controller.js');
//var GameController = require('../src/back/controllers/game.controller.js');

//-------------Services
//var CreateGameService = require('../src/back/services/createGame.service');
//var GameService = require('../src/back/services/game.service');

//var MessageBroker = _req('/src/back/modules/Business').init(wsServer);

var app = require('../src/back/app').initialize(wsServer);
