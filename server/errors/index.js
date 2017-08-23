'use strict';

const CouldNotCancelGameError = require('./CouldNotCancelGame');
const ClientNotFoundError = require('./ClientNotFound');
const GameNotFoundError = require('./GameNotFound');
const RouteNotFoundError = require('./RouteNotFound');
const RequestValidationError = require('./RequestValidation');
const GameNotActiveError = require('./GameNotActive');
const ClientNotBelongToGameError = require('./ClientNotBelongToGame');
const DotAlreadyExistsError = require('./DotAlreadyExistsError');
const InternalError = require('./InternalError');
const GenericError = require('./GenericError');

module.exports = {
    CouldNotCancelGameError: CouldNotCancelGameError,
    ClientNotFoundError: ClientNotFoundError,
    RouteNotFoundError: RouteNotFoundError,
    RequestValidationError: RequestValidationError,
    GameNotFoundError: GameNotFoundError,
    GameNotActiveError: GameNotActiveError,
    ClientNotBelongToGameError: ClientNotBelongToGameError,
    DotAlreadyExistsError: DotAlreadyExistsError,
    InternalError: InternalError,
    GenericError: GenericError
};