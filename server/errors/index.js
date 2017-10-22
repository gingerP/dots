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
const DotNotAllowed = require('./DotNotAllowed');
const DotsShouldBeCapturedError = require('./DotsShouldBeCaptured');
const GameActionOfferDrawNotAllowed = require('./GameActionOfferDrawNotAllowed');
const GameActionOfferCompleteNotAllowed = require('./GameActionOfferCompleteNotAllowed');
const GameActionGaveUpNotAllowed = require('./GameActionGaveUpNotAllowed');

module.exports = {
    CouldNotCancelGameError: CouldNotCancelGameError,
    ClientNotFoundError: ClientNotFoundError,
    RouteNotFoundError: RouteNotFoundError,
    RequestValidationError: RequestValidationError,
    GameNotFoundError: GameNotFoundError,
    GameNotActiveError: GameNotActiveError,
    ClientNotBelongToGameError: ClientNotBelongToGameError,
    DotAlreadyExistsError: DotAlreadyExistsError,
    DotNotAllowed: DotNotAllowed,
    InternalError: InternalError,
    GenericError: GenericError,
    DotsShouldBeCapturedError: DotsShouldBeCapturedError,
    GameActionOfferDrawNotAllowed: GameActionOfferDrawNotAllowed,
    GameActionOfferCompleteNotAllowed: GameActionOfferCompleteNotAllowed,
    GameActionGaveUpNotAllowed: GameActionGaveUpNotAllowed
};
