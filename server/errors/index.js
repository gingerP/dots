'use strict';

const CouldNotCancelGameError = require('./CouldNotCancelGame');
const ClientNotFoundError = require('./ClientNotFound');
const GameNotFoundError = require('./GameNotFound');
const RouteNotFoundError = require('./RouteNotFound');
const RequestValidationError = require('./RequestValidation');
const GameNotActiveError = require('./GameNotActive');
const ClientNotBelongToGameError = require('./ClientNotBelongToGame');
const DotAlreadyExistsError = require('./DotAlreadyExistsError');

module.exports = {
    CouldNotCancelGameError: CouldNotCancelGameError,
    ClientNotFoundError: ClientNotFoundError,
    RouteNotFoundError: RouteNotFoundError,
    RequestValidationError: RequestValidationError,
    GameNotFoundError: GameNotFoundError,
    GameNotActiveError: GameNotActiveError,
    ClientNotBelongToGameError: ClientNotBelongToGameError,
    DotAlreadyExistsError: DotAlreadyExistsError
};