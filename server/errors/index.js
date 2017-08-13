'use strict';

const CouldNotCancelGameError = require('./CouldNotCancelGame');
const ClientNotFoundError = require('./ClientDoesNotExist');
const RouteNotFoundError = require('./RouteNotFound');
const RequestValidationError = require('./RequestValidation');

module.exports = {
    CouldNotCancelGameError: CouldNotCancelGameError,
    ClientNotFoundError: ClientNotFoundError,
    RouteNotFoundError: RouteNotFoundError,
    RequestValidationError: RequestValidationError
};