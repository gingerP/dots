var GenericService = require('./generic.service').class;
var constants = require('../constants');

function CreateGameService() {}

CreateGameService.prototype = Object.create(GenericService.prototype);
CreateGameService.prototype.constructor = CreateGameService;

CreateGameService.prototype.onInvite = function() {

};

CreateGameService.prototype.onReject = function() {

};

CreateGameService.prototype.onSuccess = function() {

};

CreateGameService.prototype.getName = function() {
    return constants.CREATE_GAME_SERVICE;
};

CreateGameService.prototype.postConstructor = function(ioc) {
    this.gameService = ioc[constants.GAME_SERVICE];
    this.controller = ioc[constants.CREATE_GAME_CONTROLLER];
    this.controller.onInvitePlayer(this.onInvite);
    this.controller.onRejectPlayer(this.onReject);
    this.controller.onSuccessPlayer(this.onSuccess);
};

module.exports = {
    class: CreateGameService
};