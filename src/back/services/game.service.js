var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var _ = require('lodash');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');
var logger = _req('src/js/logger').create('GameService');

(function () {
    'use strict';

    function mergeClients(to, from) {
        var id = to._id;
        to = _.assignIn(to, from);
        to._id = id;
        return to;
    }

    function getRandomAnimal() {
        var randomIndex = Math.round((Math.random() * animals.length - 1));
        return animals[randomIndex];
    }

    function getRandomColor() {
        var randomIndex = Math.round((Math.random() * colors.length - 1));
        return colors[randomIndex];
    }

    function GameService() {
    }

    GameService.prototype = Object.create(GenericService.prototype);
    GameService.prototype.constructor = GameService;



    GameService.prototype.getName = function () {
        return constants.GAME_SERVICE;
    };

    GameService.prototype.postConstructor = function (ioc) {
        this.gameController = ioc[constants.GAME_CONTROLLER];
        this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
        this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    };

    module.exports = {
        class: GameService
    };

})();