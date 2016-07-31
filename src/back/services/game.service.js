var GenericService = require('./generic.service').class;
var constants = require('../constants/constants');
var animals = require('../animals');
var colors = require('../colors');
var _ = require('lodash');
var funcUtils = require('../utils/function-utils');
var gameStatuses = require('../constants/game-statuses');

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

    GameService.prototype.onNewClient = function (message) {
        var inst = this;
        var now = Date.now();
        var client = {
            connection_id: message.client.getId(),
            created: now,
            updated: now,
            name: getRandomAnimal(),
            color: getRandomColor()
        };
        this.clientsDBManager.save(client).then(function (data) {
            inst.clientsDBManager.getByCriteria({_id: data}).then(message.callback);
        });
    };

    GameService.prototype.onReconnect = function (message) {
        var inst = this;
        var clientObj;
        if (message.data) {
            inst.clientsDBManager.getByCriteria({connection_id: message.data.connection_id}).then(function (client) {
                client = client || {};
                message.data.connection_id = message.client.getId();
                client = mergeClients(client, message.data);
                clientObj = _.cloneDeep(client);
                return inst.clientsDBManager.saveByCriteria(client, {_id: client._id});
            }).then(function () {
                message.callback(clientObj);
            });
        } else {
            return new Promise(function(resolve) {
                resolve({});
            })
        }
    };

    GameService.prototype.newGame = function(clientAId, clientBId) {
        return this.gameDBManager.createGame(clientAId, clientBId, gameStatuses.active);
    };

    GameService.prototype.getName = function () {
        return constants.GAME_SERVICE;
    };

    GameService.prototype.postConstructor = function (ioc) {
        this.gameController = ioc[constants.GAME_CONTROLLER];
        this.gameController.onNewClient(this.onNewClient.bind(this));
        this.gameController.onReconnect(this.onReconnect.bind(this));
        this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
        this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    };

    module.exports = {
        class: GameService
    };

})();