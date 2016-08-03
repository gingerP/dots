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

    GameService.prototype.onCancelGame = function(message) {
        var clientId;
        var connectionId;
        if (message.data && message.data.clients.length) {
            clientId = message.data.clients[0];
            connectionId = message.client.getId();
            this.clientsDBManager.getClientsPair(clientId, connectionId).then(this.cancelGame.bind(this));
        }
    };

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

    GameService.prototype.cancelGame = function(clientA, clientB) {
        var inst = this;
        return this.gameDBManager.getGame(clientA, clientB, gameStatuses.active).then(function(game) {
            if (game) {
                game.status = gameStatuses.closed;
                inst.gameDBManager.save(game);
                inst.gameController.cancelGame([clientA, clientB], game);
            } else {
                logger.error('No game found for %s and %s clients', clientA, clientB);
            }
        });
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
        this.gameController.onCancelGame(this.onCancelGame.bind(this));
        this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
        this.gameDBManager = ioc[constants.GAME_DB_MANAGER];
    };

    module.exports = {
        class: GameService
    };

})();