var GenericService = require('./generic.service').class;
var constants = require('../constants');
var funcUtils = require('../utils/function-utils');
var uuid = require('uuid');
var _ = require('lodash');
var Promise = require('q');
var logger = _req('src/js/logger').create('CreateGameService');

function CreateGameService() {}

CreateGameService.prototype = Object.create(GenericService.prototype);
CreateGameService.prototype.constructor = CreateGameService;

CreateGameService.prototype.onInvite = function(message) {
    var clientId;
    var inst = this;
    if (message.data.clients && message.data.clients.length) {
        clientId = message.data.clients[0];
        Promise.all([
            this.clientsDBManager.getClient(clientId),                                      //To
            this.clientsDBManager.getClientByConnectionId(message.client.getId())           //From
        ]).then(function(clients) {
            var to = clients[0];
            var from = clients[1];
            if (!_.isEmpty(to) && !_.isEmpty(from)) {
                inst.controller.invitePlayer(from, to);
            } else {
                logger.warn("Invite - client does not exist!");
            }
        });
    }
};

CreateGameService.prototype.onReject = function(message) {

};

CreateGameService.prototype.onSuccess = function(message) {

};

CreateGameService.prototype.hasOtherInvitesToTheSameClient = function(from, to) {

};

CreateGameService.prototype.getName = function() {
    return constants.CREATE_GAME_SERVICE;
};

CreateGameService.prototype.postConstructor = function(ioc) {
    this.transmitter = ioc[constants.COMMON_TRANSMITTER];
    this.gameService = ioc[constants.GAME_SERVICE];
    this.controller = ioc[constants.CREATE_GAME_CONTROLLER];

    this.controller.onInvitePlayer(funcUtils.wrapListener(this, this.onInvite));
    this.controller.onRejectPlayer(funcUtils.wrapListener(this, this.onReject));
    this.controller.onSuccessPlayer(funcUtils.wrapListener(this, this.onSuccess));

    this.clientsDBManager = ioc[constants.CLIENTS_DB_MANAGER];
};

module.exports = {
    class: CreateGameService
};