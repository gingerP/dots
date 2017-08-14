'use strict';

const CouldNotCancelGameError = require('./CouldNotCancelGame');
const ClientNotFoundError = require('./ClientNotFound');
const GameNotFoundError = require('./GameNotFound');
const RouteNotFoundError = require('./RouteNotFound');
const RequestValidationError = require('./RequestValidation');

module.exports = {
    CouldNotCancelGameError: CouldNotCancelGameError,
    ClientNotFoundError: ClientNotFoundError,
    RouteNotFoundError: RouteNotFoundError,
    RequestValidationError: RequestValidationError,
    GameNotFoundError: GameNotFoundError
};