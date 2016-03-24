var Server = require('./WebServer').class;
var server = new Server().init().start();
require('../controller-pages').init(server.app);